import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BankAccount { id: string; name: string; }
interface Booking {
  id: string;
  date: string;
  period: string;
  status: string;
  notes: string | null;
  requested_by: string;
  created_at: string;
  room: { name: string } | null;
  tenant: { name: string; phone: string | null; specialty: string | null } | null;
}

const PERIOD_LABELS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", dia_todo: "Dia todo" };
const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "border-yellow-500/30 text-yellow-400" },
  confirmed: { label: "Confirmada", className: "border-green-500/30 text-green-400" },
  cancelled: { label: "Cancelada", className: "border-border text-muted-foreground" },
};

const AdminReservas = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [payForm, setPayForm] = useState({ amount: "", bank_account_id: "" });
  const [savingPay, setSavingPay] = useState(false);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, date, period, status, notes, requested_by, created_at, room:rooms(name), tenant:tenants(name, phone, specialty)")
      .order("date", { ascending: true });
    if (data) setBookings(data as Booking[]);
  };

  useEffect(() => {
    fetchBookings();
    supabase.from("bank_accounts").select("id, name").eq("active", true).then(({ data }) => { if (data) setBankAccounts(data); });
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const handleConfirm = async (b: Booking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed", updated_at: new Date().toISOString() })
      .eq("id", b.id);
    if (error) { toast.error("Erro ao confirmar."); return; }
    toast.success("Reserva confirmada.");
    fetchBookings();
    if (selected?.id === b.id) setSelected({ ...b, status: "confirmed" });
  };

  const handleCancel = async (b: Booking) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", b.id);
    if (error) { toast.error("Erro ao cancelar."); return; }
    toast.success("Reserva cancelada.");
    fetchBookings();
    if (selected?.id === b.id) setSelected({ ...b, status: "cancelled" });
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.amount || !selected) return;
    setSavingPay(true);
    const { error } = await supabase.from("payments").insert({
      booking_id: selected.id,
      amount: parseFloat(payForm.amount.replace(",", ".")),
      bank_account_id: payForm.bank_account_id || null,
      status: "pending",
    });
    setSavingPay(false);
    if (error) { toast.error("Erro ao registrar pagamento."); return; }
    toast.success("Pagamento registrado como pendente.");
    setPayForm({ amount: "", bank_account_id: "" });
  };

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-6">Reservas</h1>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-surface border border-border">
          {[["pending", "Pendentes"], ["confirmed", "Confirmadas"], ["cancelled", "Canceladas"], ["all", "Todas"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border border-border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-inter">Locador</TableHead>
              <TableHead className="text-xs font-inter">Sala</TableHead>
              <TableHead className="text-xs font-inter">Data</TableHead>
              <TableHead className="text-xs font-inter hidden md:table-cell">Período</TableHead>
              <TableHead className="text-xs font-inter">Status</TableHead>
              <TableHead className="text-xs font-inter hidden lg:table-cell">Origem</TableHead>
              <TableHead className="text-xs font-inter"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id} className="border-border cursor-pointer hover:bg-surface/50" onClick={() => setSelected(b)}>
                <TableCell className="text-sm font-inter">{b.tenant?.name}</TableCell>
                <TableCell className="text-sm font-inter">{b.room?.name}</TableCell>
                <TableCell className="text-sm font-inter">{format(new Date(b.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="text-sm font-inter hidden md:table-cell">{PERIOD_LABELS[b.period]}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-inter ${STATUS[b.status]?.className}`}>
                    {STATUS[b.status]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-inter hidden lg:table-cell">
                  {b.requested_by === "tenant" ? "Portal" : "Secretaria"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {b.status === "pending" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-400 hover:bg-green-500/10" onClick={() => handleConfirm(b)}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => handleCancel(b)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10 font-inter">
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-card border-border overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-barlow font-bold">{selected.tenant?.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm font-inter">
                <div><span className="text-muted-foreground">Sala:</span> {selected.room?.name}</div>
                <div><span className="text-muted-foreground">Data:</span> {format(new Date(selected.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</div>
                <div><span className="text-muted-foreground">Período:</span> {PERIOD_LABELS[selected.period]}</div>
                <div><span className="text-muted-foreground">Telefone:</span> {selected.tenant?.phone ?? "—"}</div>
                <div><span className="text-muted-foreground">Especialidade:</span> {selected.tenant?.specialty ?? "—"}</div>
                {selected.notes && <div><span className="text-muted-foreground">Notas:</span> {selected.notes}</div>}
                <div><span className="text-muted-foreground">Origem:</span> {selected.requested_by === "tenant" ? "Portal do Locador" : "Secretaria"}</div>
                <div className="flex gap-2 pt-2">
                  {selected.status === "pending" && (
                    <>
                      <Button size="sm" className="flex-1 bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-1" onClick={() => handleConfirm(selected)}>
                        <Check className="h-3 w-3" /> Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 font-inter text-xs gap-1" onClick={() => handleCancel(selected)}>
                        <X className="h-3 w-3" /> Cancelar
                      </Button>
                    </>
                  )}
                  {selected.status === "confirmed" && (
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-inter text-xs gap-1" onClick={() => handleCancel(selected)}>
                      <X className="h-3 w-3" /> Cancelar reserva
                    </Button>
                  )}
                </div>

                {/* Add payment */}
                {selected.status === "confirmed" && (
                  <div className="pt-4 border-t border-border">
                    <p className="font-barlow font-bold text-sm mb-3">Registrar pagamento</p>
                    <form onSubmit={handleAddPayment} className="space-y-3">
                      <Input
                        placeholder="Valor (ex: 350,00)"
                        value={payForm.amount}
                        onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                        className="bg-background border-border font-inter text-sm"
                      />
                      <Select value={payForm.bank_account_id} onValueChange={(v) => setPayForm({ ...payForm, bank_account_id: v })}>
                        <SelectTrigger className="bg-background border-border font-inter text-sm">
                          <SelectValue placeholder="Conta bancária (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((a) => (
                            <SelectItem key={a.id} value={a.id} className="font-inter text-sm">{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="submit" disabled={savingPay || !payForm.amount} size="sm" className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs">
                        {savingPay ? "Registrando..." : "Registrar pagamento pendente"}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminReservas;
