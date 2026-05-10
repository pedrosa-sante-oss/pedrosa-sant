import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sendBookingWebhook } from "@/lib/webhook";
import { toast } from "sonner";
import { Plus, UserPlus } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

interface Room { id: string; name: string; }
interface Tenant { id: string; name: string; phone: string | null; specialty: string | null; }
interface Booking {
  id: string;
  date: string;
  period: string;
  status: string;
  notes: string | null;
  room: { name: string } | null;
  tenant: { name: string } | null;
}

const PERIOD_LABELS: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite (18h–22h)",
  dia_todo: "Dia todo",
};

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "border-yellow-500/30 text-yellow-400" },
  confirmed: { label: "Confirmada", className: "border-green-500/30 text-green-400" },
  cancelled: { label: "Cancelada", className: "border-border text-muted-foreground" },
};

const AdminAgenda = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [daySheet, setDaySheet] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ room_id: "", tenant_id: "", date: "", period: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const [newTenantMode, setNewTenantMode] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({ name: "", phone: "", specialty: "" });
  const [savingTenant, setSavingTenant] = useState(false);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, date, period, status, notes, room:rooms(name), tenant:tenants(name)")
      .neq("status", "cancelled")
      .order("date");
    if (data) setBookings(data as Booking[]);
  };

  useEffect(() => {
    supabase.from("rooms").select("id, name").eq("active", true).order("sort_order").then(({ data }) => { if (data) setRooms(data); });
    supabase.from("tenants").select("id, name, phone, specialty").eq("active", true).then(({ data }) => { if (data) setTenants(data); });
    fetchBookings();
  }, []);

  const dayBookings = selectedDate
    ? bookings.filter((b) => {
        const match = b.date === format(selectedDate, "yyyy-MM-dd");
        return match && (selectedRoom === "all" || b.room?.name === rooms.find((r) => r.id === selectedRoom)?.name);
      })
    : [];

  const datesWithBookings = new Set(
    bookings
      .filter((b) => selectedRoom === "all" || b.room?.name === rooms.find((r) => r.id === selectedRoom)?.name)
      .map((b) => b.date)
  );

  const handleDayClick = (day: Date | undefined) => {
    setSelectedDate(day);
    if (day) setDaySheet(true);
  };

  const handleSaveTenant = async () => {
    if (!newTenantForm.name.trim()) { toast.error("Nome do locador é obrigatório."); return; }
    setSavingTenant(true);
    const { data, error } = await supabase.from("tenants").insert({
      name: newTenantForm.name.trim(),
      email: `${newTenantForm.name.trim().toLowerCase().replace(/\s+/g, ".")}@pendente.local`,
      phone: newTenantForm.phone.trim() || null,
      specialty: newTenantForm.specialty.trim() || null,
    }).select("id, name, phone, specialty").single();
    setSavingTenant(false);
    if (error) { toast.error("Erro ao cadastrar locador."); return; }
    if (data) {
      setTenants((prev) => [...prev, data as Tenant]);
      setForm((f) => ({ ...f, tenant_id: data.id }));
      setNewTenantMode(false);
      setNewTenantForm({ name: "", phone: "", specialty: "" });
      toast.success("Locador cadastrado e selecionado.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.room_id || !form.tenant_id || !form.date || !form.period) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("bookings").insert({
      room_id: form.room_id,
      tenant_id: form.tenant_id,
      date: form.date,
      period: form.period as "manha" | "tarde" | "noite" | "dia_todo",
      requested_by: "secretary",
      notes: form.notes.trim() || null,
    });
    if (error) { toast.error("Erro ao criar reserva."); setSaving(false); return; }

    const room = rooms.find((r) => r.id === form.room_id);
    const tenant = tenants.find((t) => t.id === form.tenant_id);
    if (room && tenant) {
      await sendBookingWebhook({
        locador_nome: tenant.name,
        locador_telefone: tenant.phone,
        locador_especialidade: tenant.specialty,
        sala: room.name,
        data: form.date,
        periodo: form.period,
        origem: "secretaria",
      });
    }

    toast.success("Reserva criada.");
    setCreateOpen(false);
    setForm({ room_id: "", tenant_id: "", date: "", period: "", notes: "" });
    setNewTenantMode(false);
    setSaving(false);
    fetchBookings();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-barlow font-bold text-xl">Agenda</h1>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-2"
        >
          <Plus className="h-3 w-3" /> Nova Reserva
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="space-y-4">
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="bg-surface border-border font-inter text-sm w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-inter text-sm">Todas as salas</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id} className="font-inter text-sm">{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            locale={ptBR}
            modifiers={{ hasBooking: (date) => datesWithBookings.has(format(date, "yyyy-MM-dd")) }}
            modifiersClassNames={{ hasBooking: "bg-lima/20 text-lima font-bold" }}
            className="border border-border bg-surface rounded"
          />
        </div>

        <div className="flex-1">
          <p className="text-sm font-barlow font-bold mb-4">Próximas reservas</p>
          <div className="space-y-2">
            {bookings.slice(0, 10).map((b) => (
              <div key={b.id} className="border border-border bg-surface rounded p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-inter font-medium">{b.tenant?.name}</p>
                  <p className="text-xs text-muted-foreground font-inter">
                    {b.room?.name} · {format(new Date(b.date + "T12:00:00"), "dd/MM", { locale: ptBR })} · {PERIOD_LABELS[b.period]}
                  </p>
                </div>
                <Badge variant="outline" className={`text-[10px] font-inter shrink-0 ${STATUS[b.status]?.className}`}>
                  {STATUS[b.status]?.label}
                </Badge>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-xs text-muted-foreground font-inter py-4">Nenhuma reserva.</p>
            )}
          </div>
        </div>
      </div>

      {/* Day detail sheet */}
      <Sheet open={daySheet} onOpenChange={setDaySheet}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="font-barlow font-bold">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {dayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground font-inter">Sem reservas neste dia.</p>
            ) : (
              dayBookings.map((b) => (
                <div key={b.id} className="border border-border bg-surface rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-inter font-medium">{b.tenant?.name}</p>
                    <Badge variant="outline" className={`text-[10px] font-inter ${STATUS[b.status]?.className}`}>
                      {STATUS[b.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-inter">{b.room?.name} · {PERIOD_LABELS[b.period]}</p>
                  {b.notes && <p className="text-xs text-muted-foreground font-inter mt-1 italic">{b.notes}</p>}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setNewTenantMode(false); setNewTenantForm({ name: "", phone: "", specialty: "" }); } }}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-barlow font-bold">Nova Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Sala *</label>
              <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar sala" /></SelectTrigger>
                <SelectContent>{rooms.map((r) => <SelectItem key={r.id} value={r.id} className="font-inter text-sm">{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Locador com opção de cadastrar novo */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground font-inter">Locador *</label>
                <button
                  type="button"
                  onClick={() => setNewTenantMode(!newTenantMode)}
                  className="text-xs text-lima font-inter flex items-center gap-1 hover:underline"
                >
                  <UserPlus className="h-3 w-3" /> {newTenantMode ? "Selecionar existente" : "+ Novo locador"}
                </button>
              </div>
              {!newTenantMode ? (
                <Select value={form.tenant_id} onValueChange={(v) => setForm({ ...form, tenant_id: v })}>
                  <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar locador" /></SelectTrigger>
                  <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id} className="font-inter text-sm">{t.name}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <div className="space-y-2 border border-lima/20 rounded p-3 bg-background">
                  <Input placeholder="Nome *" value={newTenantForm.name} onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })} className="bg-background border-border font-inter text-sm" />
                  <Input placeholder="Telefone" value={newTenantForm.phone} onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })} className="bg-background border-border font-inter text-sm" />
                  <Input placeholder="Especialidade" value={newTenantForm.specialty} onChange={(e) => setNewTenantForm({ ...newTenantForm, specialty: e.target.value })} className="bg-background border-border font-inter text-sm" />
                  <div className="flex gap-2">
                    <Button type="button" size="sm" disabled={savingTenant} onClick={handleSaveTenant} className="flex-1 bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs">
                      {savingTenant ? "Salvando..." : "Salvar locador"}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setNewTenantMode(false)} className="font-inter text-xs border-border">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Data *</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-background border-border font-inter text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Período *</label>
              <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar período" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha" className="font-inter text-sm">Manhã (08h–12h)</SelectItem>
                  <SelectItem value="tarde" className="font-inter text-sm">Tarde (14h–18h)</SelectItem>
                  <SelectItem value="noite" className="font-inter text-sm">Noite (18h–22h)</SelectItem>
                  <SelectItem value="dia_todo" className="font-inter text-sm">Dia todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Observações</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="Opcional..." />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm">
              {saving ? "Salvando..." : "Criar Reserva"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgenda;
