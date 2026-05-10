import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { sendBookingWebhook } from "@/lib/webhook";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

interface Room {
  id: string;
  name: string;
  photo_url: string | null;
}

interface Booking {
  id: string;
  date: string;
  period: string;
  status: string;
  room_id: string;
}

const PERIOD_LABELS: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite (18h–22h)",
  dia_todo: "Dia todo",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-muted text-muted-foreground",
};

const LocadorAgenda = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [tenantData, setTenantData] = useState<{ name: string; phone: string | null; specialty: string | null } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: tenant } = await supabase
        .from("tenants")
        .select("id, name, phone, specialty")
        .eq("user_id", session.user.id)
        .single();

      if (tenant) {
        setTenantId(tenant.id);
        setTenantData({ name: tenant.name, phone: tenant.phone, specialty: tenant.specialty });
      }

      const { data: roomsData } = await supabase
        .from("rooms")
        .select("id, name, photo_url")
        .eq("active", true)
        .order("sort_order");

      if (roomsData) {
        setRooms(roomsData);
        if (roomsData.length > 0) setSelectedRoom(roomsData[0].id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    supabase
      .from("bookings")
      .select("id, date, period, status, room_id")
      .eq("tenant_id", tenantId)
      .neq("status", "cancelled")
      .then(({ data }) => { if (data) setBookings(data); });
  }, [tenantId]);

  // Compute dates that are fully booked for selected room
  const bookedDates = new Set(
    bookings
      .filter((b) => b.room_id === selectedRoom && b.status === "confirmed" && b.period === "dia_todo")
      .map((b) => b.date)
  );

  const partialDates = new Set(
    bookings
      .filter((b) => b.room_id === selectedRoom && b.status === "confirmed" && b.period !== "dia_todo")
      .map((b) => b.date)
  );

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    setSelectedDate(day);
    setPeriod("");
    setNotes("");
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedRoom || !period) {
      toast.error("Selecione sala, data e período.");
      return;
    }
    if (!tenantId) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Check for conflict
    const conflict = bookings.find(
      (b) =>
        b.room_id === selectedRoom &&
        b.date === dateStr &&
        b.status === "confirmed" &&
        (b.period === "dia_todo" || b.period === period || period === "dia_todo")
    );
    if (conflict) {
      toast.error("Este horário já está reservado para esta sala.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("bookings").insert({
      room_id: selectedRoom,
      tenant_id: tenantId,
      date: dateStr,
      period: period as "manha" | "tarde" | "dia_todo",
      requested_by: "tenant",
      notes: notes.trim() || null,
    });

    if (error) {
      toast.error("Erro ao enviar pedido.");
      setSaving(false);
      return;
    }

    // Send webhook
    const room = rooms.find((r) => r.id === selectedRoom);
    if (room && tenantData) {
      await sendBookingWebhook({
        locador_nome: tenantData.name,
        locador_telefone: tenantData.phone,
        locador_especialidade: tenantData.specialty,
        sala: room.name,
        data: dateStr,
        periodo: period,
        origem: "portal_locador",
      });
    }

    toast.success("Pedido enviado! A secretaria entrará em contato.");
    setDialogOpen(false);
    setSaving(false);

    // Refresh bookings
    const { data } = await supabase
      .from("bookings")
      .select("id, date, period, status, room_id")
      .eq("tenant_id", tenantId)
      .neq("status", "cancelled");
    if (data) setBookings(data);
  };

  const myUpcoming = bookings
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-2">Solicitar Reserva</h1>
      <p className="text-xs text-muted-foreground font-inter mb-8">
        Selecione a sala e clique num dia disponível para fazer seu pedido.
      </p>

      <div className="grid md:grid-cols-[auto_1fr] gap-8">
        {/* Calendar side */}
        <div className="space-y-4">
          {/* Room selector */}
          <div>
            <label className="text-xs text-muted-foreground font-inter block mb-2">Sala</label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="bg-surface border-border font-inter text-sm w-48">
                <SelectValue placeholder="Selecionar sala" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="font-inter text-sm">{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            locale={ptBR}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            modifiers={{
              booked: (date) => bookedDates.has(format(date, "yyyy-MM-dd")),
              partial: (date) => partialDates.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              booked: "bg-red-500/20 text-red-400 line-through",
              partial: "bg-yellow-500/10 text-yellow-400",
            }}
            className="border border-border bg-surface rounded"
          />

          <div className="flex gap-4 text-[10px] font-inter text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500/40"></span>Ocupado</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500/40"></span>Parcial</span>
          </div>
        </div>

        {/* My upcoming bookings */}
        <div>
          <p className="text-sm font-barlow font-bold mb-4">Minhas próximas reservas</p>
          {myUpcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground font-inter">Nenhuma reserva ainda.</p>
          ) : (
            <div className="space-y-3">
              {myUpcoming.map((b) => {
                const room = rooms.find((r) => r.id === b.room_id);
                return (
                  <div key={b.id} className="border border-border bg-surface rounded p-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-inter font-medium">{room?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground font-inter">
                        {format(new Date(b.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })} · {PERIOD_LABELS[b.period]}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-inter shrink-0 ${STATUS_COLORS[b.status]}`}>
                      {b.status === "pending" ? "Aguardando" : b.status === "confirmed" ? "Confirmada" : "Cancelada"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-barlow font-bold">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-2">Sala</label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="bg-background border-border font-inter text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="font-inter text-sm">{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-2">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="bg-background border-border font-inter text-sm">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha" className="font-inter text-sm">Manhã (08h–12h)</SelectItem>
                  <SelectItem value="tarde" className="font-inter text-sm">Tarde (14h–18h)</SelectItem>
                  <SelectItem value="noite" className="font-inter text-sm">Noite (18h–22h)</SelectItem>
                  <SelectItem value="dia_todo" className="font-inter text-sm">Dia todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-2">Observações (opcional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alguma observação..."
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-lima"
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving || !period}
              className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm"
            >
              {saving ? "Enviando..." : "Enviar pedido de reserva"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocadorAgenda;
