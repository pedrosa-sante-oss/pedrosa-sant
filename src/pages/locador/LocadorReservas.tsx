import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Booking {
  id: string;
  date: string;
  period: string;
  status: string;
  notes: string | null;
  room: { name: string } | null;
}

const PERIOD_LABELS: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  dia_todo: "Dia todo",
};

const STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Aguardando", className: "border-yellow-500/30 text-yellow-400" },
  confirmed: { label: "Confirmada", className: "border-green-500/30 text-green-400" },
  cancelled: { label: "Cancelada", className: "border-border text-muted-foreground" },
};

const LocadorReservas = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenantId, setTenantId] = useState("");

  const fetchBookings = async (tid: string) => {
    const { data } = await supabase
      .from("bookings")
      .select("id, date, period, status, notes, room:rooms(name)")
      .eq("tenant_id", tid)
      .order("date", { ascending: false });
    if (data) setBookings(data as Booking[]);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", session.user.id)
        .single();
      if (tenant) {
        setTenantId(tenant.id);
        fetchBookings(tenant.id);
      }
    };
    init();
  }, []);

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) { toast.error("Erro ao cancelar."); return; }
    toast.success("Reserva cancelada.");
    fetchBookings(tenantId);
  };

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-6">Minhas Reservas</h1>

      <div className="border border-border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-inter">Sala</TableHead>
              <TableHead className="text-xs font-inter">Data</TableHead>
              <TableHead className="text-xs font-inter hidden md:table-cell">Período</TableHead>
              <TableHead className="text-xs font-inter">Status</TableHead>
              <TableHead className="text-xs font-inter"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id} className="border-border hover:bg-surface/50">
                <TableCell className="text-sm font-inter">{b.room?.name ?? "—"}</TableCell>
                <TableCell className="text-sm font-inter">
                  {format(new Date(b.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-sm font-inter hidden md:table-cell">
                  {PERIOD_LABELS[b.period]}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-inter ${STATUS[b.status]?.className}`}>
                    {STATUS[b.status]?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {b.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-inter text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7"
                      onClick={() => handleCancel(b.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10 font-inter">
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LocadorReservas;
