import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  room_interest: string | null;
  message: string | null;
  status: string;
}

const statuses = ["todos", "novo", "em_contato", "fechado", "sem_interesse"];
const statusColors: Record<string, string> = {
  novo: "bg-lima/20 text-lima",
  em_contato: "bg-blue-500/20 text-blue-400",
  fechado: "bg-green-500/20 text-green-400",
  sem_interesse: "bg-muted text-muted-foreground",
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = filter === "todos" ? leads : leads.filter((l) => l.status === filter);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar."); return; }
    toast.success("Status atualizado.");
    fetchLeads();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const exportCSV = () => {
    const header = "Nome,Especialidade,Sala,WhatsApp,E-mail,Status,Data\n";
    const rows = leads.map((l) =>
      [l.name, l.specialty, l.room_interest || "", l.phone, l.email, l.status, new Date(l.created_at).toLocaleDateString("pt-BR")].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leads-pedrosa-sante.csv";
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-barlow font-bold text-xl">Leads</h1>
        <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs font-inter gap-2 border-border">
          <Download className="h-3 w-3" /> Exportar CSV
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="bg-surface border border-border">
          {statuses.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs font-inter capitalize data-[state=active]:bg-lima/10 data-[state=active]:text-lima">
              {s === "todos" ? "Todos" : s.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="border border-border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-inter">Nome</TableHead>
              <TableHead className="text-xs font-inter hidden md:table-cell">Especialidade</TableHead>
              <TableHead className="text-xs font-inter hidden md:table-cell">Sala</TableHead>
              <TableHead className="text-xs font-inter hidden lg:table-cell">WhatsApp</TableHead>
              <TableHead className="text-xs font-inter">Status</TableHead>
              <TableHead className="text-xs font-inter hidden md:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id} className="border-border cursor-pointer hover:bg-surface/50" onClick={() => setSelected(lead)}>
                <TableCell className="text-sm font-inter">{lead.name}</TableCell>
                <TableCell className="text-sm font-inter hidden md:table-cell">{lead.specialty}</TableCell>
                <TableCell className="text-sm font-inter hidden md:table-cell">{lead.room_interest || "—"}</TableCell>
                <TableCell className="text-sm font-inter hidden lg:table-cell">{lead.phone}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded font-inter ${statusColors[lead.status] || "bg-muted text-muted-foreground"}`}>
                    {lead.status.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-inter hidden md:table-cell">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10 font-inter">Nenhum lead encontrado.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-card border-border">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-barlow font-bold">{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm font-inter">
                <div><span className="text-muted-foreground">E-mail:</span> <span>{selected.email}</span></div>
                <div><span className="text-muted-foreground">WhatsApp:</span> <span>{selected.phone}</span></div>
                <div><span className="text-muted-foreground">Especialidade:</span> <span>{selected.specialty}</span></div>
                <div><span className="text-muted-foreground">Sala:</span> <span>{selected.room_interest || "—"}</span></div>
                <div><span className="text-muted-foreground">Data:</span> <span>{new Date(selected.created_at).toLocaleString("pt-BR")}</span></div>
                {selected.message && <div><span className="text-muted-foreground">Mensagem:</span><p className="mt-1">{selected.message}</p></div>}
                <div>
                  <span className="text-muted-foreground block mb-2">Status:</span>
                  <Select value={selected.status} onValueChange={(v) => updateStatus(selected.id, v)}>
                    <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="em_contato">Em contato</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="sem_interesse">Sem interesse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLeads;
