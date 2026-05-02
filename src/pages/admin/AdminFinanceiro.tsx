import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

interface BankAccount { id: string; name: string; }
interface Payment {
  id: string;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  status: string;
  notes: string | null;
  bank_account: { name: string } | null;
  booking: { date: string; period: string; tenant: { name: string } | null; room: { name: string } | null } | null;
}
interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes: string | null;
  bank_account: { name: string } | null;
}

const EXPENSE_CATEGORIES = ["Aluguel", "Energia", "Água", "Internet", "Manutenção", "Limpeza", "Material", "Outros"];
const PERIOD_LABELS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", dia_todo: "Dia todo" };

const PAY_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "border-yellow-500/30 text-yellow-400" },
  paid: { label: "Pago", className: "border-green-500/30 text-green-400" },
  overdue: { label: "Atrasado", className: "border-red-500/30 text-red-400" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const AdminFinanceiro = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [markOpen, setMarkOpen] = useState<Payment | null>(null);
  const [markForm, setMarkForm] = useState({ paid_at: format(new Date(), "yyyy-MM-dd"), bank_account_id: "" });
  const [expOpen, setExpOpen] = useState(false);
  const [expForm, setExpForm] = useState({ description: "", category: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), bank_account_id: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [dreMonth, setDreMonth] = useState(format(new Date(), "yyyy-MM"));

  const fetchAll = async () => {
    supabase.from("payments")
      .select("id, amount, due_date, paid_at, status, notes, bank_account:bank_accounts(name), booking:bookings(date, period, tenant:tenants(name), room:rooms(name))")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPayments(data as Payment[]); });

    supabase.from("expenses")
      .select("id, description, category, amount, date, notes, bank_account:bank_accounts(name)")
      .order("date", { ascending: false })
      .then(({ data }) => { if (data) setExpenses(data as Expense[]); });

    supabase.from("bank_accounts").select("id, name").eq("active", true)
      .then(({ data }) => { if (data) setBankAccounts(data); });
  };

  useEffect(() => { fetchAll(); }, []);

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markOpen) return;
    setSaving(true);
    const { error } = await supabase.from("payments").update({
      status: "paid",
      paid_at: markForm.paid_at,
      bank_account_id: markForm.bank_account_id || null,
    }).eq("id", markOpen.id);
    setSaving(false);
    if (error) { toast.error("Erro ao atualizar pagamento."); return; }
    toast.success("Pagamento marcado como pago.");
    setMarkOpen(null);
    fetchAll();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.description || !expForm.category || !expForm.amount || !expForm.date) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      description: expForm.description.trim(),
      category: expForm.category,
      amount: parseFloat(expForm.amount.replace(",", ".")),
      date: expForm.date,
      bank_account_id: expForm.bank_account_id || null,
      notes: expForm.notes.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao registrar despesa."); return; }
    toast.success("Despesa registrada.");
    setExpOpen(false);
    setExpForm({ description: "", category: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), bank_account_id: "", notes: "" });
    fetchAll();
  };

  // DRE calculations
  const dreYear = dreMonth.slice(0, 4);
  const dreMon = dreMonth.slice(5, 7);
  const drePayments = payments.filter((p) => p.status === "paid" && p.paid_at && p.paid_at.startsWith(dreMonth));
  const dreExpenses = expenses.filter((e) => e.date.startsWith(dreMonth));
  const totalRevenue = drePayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = dreExpenses.reduce((s, e) => s + e.amount, 0);
  const result = totalRevenue - totalExpenses;

  const expByCategory: Record<string, number> = {};
  dreExpenses.forEach((e) => { expByCategory[e.category] = (expByCategory[e.category] ?? 0) + e.amount; });

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-6">Financeiro</h1>

      <Tabs defaultValue="recebimentos">
        <TabsList className="bg-surface border border-border mb-6">
          <TabsTrigger value="recebimentos" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Recebimentos</TabsTrigger>
          <TabsTrigger value="despesas" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Despesas</TabsTrigger>
          <TabsTrigger value="dre" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">DRE</TabsTrigger>
        </TabsList>

        {/* RECEBIMENTOS */}
        <TabsContent value="recebimentos">
          <div className="border border-border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-inter">Locador</TableHead>
                  <TableHead className="text-xs font-inter hidden md:table-cell">Sala / Data</TableHead>
                  <TableHead className="text-xs font-inter">Valor</TableHead>
                  <TableHead className="text-xs font-inter">Status</TableHead>
                  <TableHead className="text-xs font-inter hidden lg:table-cell">Conta</TableHead>
                  <TableHead className="text-xs font-inter"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-sm font-inter">{p.booking?.tenant?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter hidden md:table-cell">
                      {p.booking ? `${p.booking.room?.name} · ${p.booking.date ? format(new Date(p.booking.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : ""}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-inter font-medium">{fmt(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-inter ${PAY_STATUS[p.status]?.className}`}>
                        {PAY_STATUS[p.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter hidden lg:table-cell">
                      {p.bank_account?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      {p.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-inter text-lima hover:bg-lima/10 h-7"
                          onClick={() => { setMarkOpen(p); setMarkForm({ paid_at: format(new Date(), "yyyy-MM-dd"), bank_account_id: "" }); }}
                        >
                          Marcar pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10 font-inter">Nenhum recebimento.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* DESPESAS */}
        <TabsContent value="despesas">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setExpOpen(true)} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-2">
              <Plus className="h-3 w-3" /> Nova Despesa
            </Button>
          </div>
          <div className="border border-border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-inter">Descrição</TableHead>
                  <TableHead className="text-xs font-inter">Categoria</TableHead>
                  <TableHead className="text-xs font-inter">Valor</TableHead>
                  <TableHead className="text-xs font-inter">Data</TableHead>
                  <TableHead className="text-xs font-inter hidden md:table-cell">Conta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-sm font-inter">{e.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter">{e.category}</TableCell>
                    <TableCell className="text-sm font-inter font-medium text-red-400">{fmt(e.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter">{format(new Date(e.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter hidden md:table-cell">{e.bank_account?.name ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10 font-inter">Nenhuma despesa.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* DRE */}
        <TabsContent value="dre">
          <div className="flex items-center gap-4 mb-8">
            <Input type="month" value={dreMonth} onChange={(e) => setDreMonth(e.target.value)} className="bg-surface border-border font-inter text-sm w-48" />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="border border-border bg-surface rounded p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-lima" />
                <span className="text-xs text-muted-foreground font-inter">Receita bruta</span>
              </div>
              <p className="text-2xl font-barlow font-bold text-lima">{fmt(totalRevenue)}</p>
            </div>
            <div className="border border-border bg-surface rounded p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs text-muted-foreground font-inter">Total despesas</span>
              </div>
              <p className="text-2xl font-barlow font-bold text-red-400">{fmt(totalExpenses)}</p>
            </div>
            <div className={`border rounded p-5 ${result >= 0 ? "border-lima/30 bg-lima/5" : "border-red-500/30 bg-red-500/5"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground font-inter">Resultado</span>
              </div>
              <p className={`text-2xl font-barlow font-bold ${result >= 0 ? "text-lima" : "text-red-400"}`}>{fmt(result)}</p>
            </div>
          </div>

          {/* Expenses breakdown */}
          <div className="border border-border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-inter">Categoria</TableHead>
                  <TableHead className="text-xs font-inter text-right">Total</TableHead>
                  <TableHead className="text-xs font-inter text-right hidden md:table-cell">% da receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(expByCategory).map(([cat, val]) => (
                  <TableRow key={cat} className="border-border hover:bg-surface/50">
                    <TableCell className="text-sm font-inter">{cat}</TableCell>
                    <TableCell className="text-sm font-inter text-right text-red-400">{fmt(val)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter text-right hidden md:table-cell">
                      {totalRevenue > 0 ? ((val / totalRevenue) * 100).toFixed(1) + "%" : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {Object.keys(expByCategory).length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6 font-inter">Sem despesas no período.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mark paid dialog */}
      <Dialog open={!!markOpen} onOpenChange={(o) => !o && setMarkOpen(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-barlow font-bold">Marcar como Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMarkPaid} className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Data do pagamento</label>
              <Input type="date" value={markForm.paid_at} onChange={(e) => setMarkForm({ ...markForm, paid_at: e.target.value })} className="bg-background border-border font-inter text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Conta onde entrou</label>
              <Select value={markForm.bank_account_id} onValueChange={(v) => setMarkForm({ ...markForm, bank_account_id: v })}>
                <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar conta" /></SelectTrigger>
                <SelectContent>{bankAccounts.map((a) => <SelectItem key={a.id} value={a.id} className="font-inter text-sm">{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm">
              {saving ? "Salvando..." : "Confirmar pagamento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add expense dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-barlow font-bold">Nova Despesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Descrição *</label>
              <Input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="Conta de energia — maio" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Categoria *</label>
                <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v })}>
                  <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="font-inter text-sm">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Valor (R$) *</label>
                <Input value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="0,00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Data *</label>
                <Input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} className="bg-background border-border font-inter text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Conta</label>
                <Select value={expForm.bank_account_id} onValueChange={(v) => setExpForm({ ...expForm, bank_account_id: v })}>
                  <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>{bankAccounts.map((a) => <SelectItem key={a.id} value={a.id} className="font-inter text-sm">{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm">
              {saving ? "Salvando..." : "Registrar despesa"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinanceiro;
