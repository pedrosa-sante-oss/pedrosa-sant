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
import { Plus, TrendingUp, TrendingDown, Printer, MessageCircle } from "lucide-react";

interface BankAccount { id: string; name: string; }
interface Tenant { id: string; name: string; }
interface Payment {
  id: string;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  status: string;
  notes: string | null;
  bank_account: { name: string } | null;
  booking: {
    date: string;
    period: string;
    tenant: { id: string; name: string } | null;
    room: { name: string } | null;
  } | null;
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
interface TenantCharge {
  id: string;
  tenant_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  date: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
  tenant: { name: string } | null;
}
interface ReceiptData {
  tenantName: string;
  paidAt: string;
  items: { label: string; amount: number }[];
  total: number;
}

const EXPENSE_CATEGORIES = ["Aluguel", "Energia", "Água", "Internet", "Manutenção", "Limpeza", "Material", "Outros"];
const PERIOD_LABELS: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite", dia_todo: "Dia todo" };
const ITEMS_PADRAO = [
  { label: "Cápsula de café", price: 3.00 },
  { label: "Refrigerante em lata", price: 5.00 },
  { label: "Coffee break", price: 20.00 },
  { label: "Outro", price: 0 },
];
const PAY_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "border-yellow-500/30 text-yellow-400" },
  paid: { label: "Pago", className: "border-green-500/30 text-green-400" },
  overdue: { label: "Atrasado", className: "border-red-500/30 text-red-400" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const buildReceiptHtml = (data: ReceiptData) => {
  const dateStr = format(new Date(data.paidAt + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR });
  return `<style>body{font-family:Arial,sans-serif;padding:40px;max-width:420px}h2{margin:0 0 4px;font-size:1.3em}.sub{color:#666;font-size:.85em;margin:0}hr{border:none;border-top:1px solid #ddd;margin:14px 0}.row{display:flex;justify-content:space-between;margin:6px 0;font-size:.9em}.bold{font-weight:700}.footer{color:#888;font-size:.75em;text-align:center;margin-top:20px}</style>
<h2>Pedrosa Santé</h2><p class="sub">Recibo de Pagamento</p><hr>
<div class="row"><span><b>Locador:</b></span><span>${data.tenantName}</span></div>
<div class="row"><span><b>Data:</b></span><span>${dateStr}</span></div><hr>
${data.items.map(i => `<div class="row"><span>${i.label}</span><span>${fmt(i.amount)}</span></div>`).join("")}
<hr><div class="row bold"><span>TOTAL PAGO</span><span>${fmt(data.total)}</span></div>
<p class="footer">Pedrosa Santé · Caruaru-PE</p>`;
};

const buildContasReceberHtml = (tenantName: string, pmts: Payment[], chgs: TenantCharge[]) => {
  const total = pmts.reduce((s, p) => s + p.amount, 0) + chgs.reduce((s, c) => s + c.amount, 0);
  const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
  let body = `<style>body{font-family:Arial,sans-serif;padding:40px;max-width:520px}h2{margin:0 0 4px;font-size:1.3em}h4{margin:14px 0 6px;color:#444;border-bottom:1px solid #eee;padding-bottom:4px}.sub{color:#666;font-size:.85em;margin:0}hr{border:none;border-top:1px solid #ddd;margin:14px 0}.row{display:flex;justify-content:space-between;margin:5px 0;font-size:.9em}.bold{font-weight:700}.footer{color:#888;font-size:.75em;text-align:center;margin-top:20px}</style>
<h2>Pedrosa Santé</h2><p class="sub">Conta a Receber</p><hr>
<div class="row"><span><b>Dr(a). ${tenantName}</b></span><span style="color:#666;font-size:.85em">Emitido em ${today}</span></div><hr>`;
  if (pmts.length > 0) {
    body += `<h4>Reservas</h4>`;
    pmts.forEach(p => {
      const d = p.booking?.date ? format(new Date(p.booking.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : "";
      body += `<div class="row"><span>${p.booking?.room?.name ?? ""} · ${d} · ${PERIOD_LABELS[p.booking?.period ?? ""] ?? ""}</span><span>${fmt(p.amount)}</span></div>`;
    });
  }
  if (chgs.length > 0) {
    body += `<h4>Extras</h4>`;
    chgs.forEach(c => { body += `<div class="row"><span>${c.description}${c.quantity > 1 ? ` x${c.quantity}` : ""}</span><span>${fmt(c.amount)}</span></div>`; });
  }
  body += `<hr><div class="row bold"><span>TOTAL A RECEBER</span><span>${fmt(total)}</span></div><p class="footer">Pedrosa Santé · Caruaru-PE</p>`;
  return body;
};

const openPrint = (html: string, title: string) => {
  const win = window.open("", "_blank", "width=600,height=700");
  if (win) {
    win.document.write(`<!DOCTYPE html><html><head><title>${title}</title></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }
};

const buildReceiptWA = (data: ReceiptData, waNumber: string) => {
  const dateStr = format(new Date(data.paidAt + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR });
  let text = `*Recibo — Pedrosa Santé*\n*Locador: ${data.tenantName}*\nData: ${dateStr}\n\n`;
  data.items.forEach(i => { text += `• ${i.label} — ${fmt(i.amount)}\n`; });
  text += `\n*Total pago: ${fmt(data.total)}*\n\nObrigada pela preferência! 🙏`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
};

const buildContasReceberWA = (tenantName: string, pmts: Payment[], chgs: TenantCharge[], waNumber: string) => {
  const total = pmts.reduce((s, p) => s + p.amount, 0) + chgs.reduce((s, c) => s + c.amount, 0);
  let text = `*Pedrosa Santé — Conta a Receber*\n*Dr(a). ${tenantName}*\n\n`;
  if (pmts.length > 0) {
    text += `*Reservas:*\n`;
    pmts.forEach(p => {
      const d = p.booking?.date ? format(new Date(p.booking.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : "";
      text += `• ${p.booking?.room?.name ?? ""} · ${d} · ${PERIOD_LABELS[p.booking?.period ?? ""] ?? ""} — ${fmt(p.amount)}\n`;
    });
    text += "\n";
  }
  if (chgs.length > 0) {
    text += `*Extras:*\n`;
    chgs.forEach(c => { text += `• ${c.description}${c.quantity > 1 ? ` x${c.quantity}` : ""} — ${fmt(c.amount)}\n`; });
    text += "\n";
  }
  text += `*Total: ${fmt(total)}*\n\nQualquer dúvida, estamos à disposição. 🙏`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
};

const AdminFinanceiro = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [charges, setCharges] = useState<TenantCharge[]>([]);
  const [whatsapp, setWhatsapp] = useState("");

  // Recebimentos filters
  const [filterTenant, setFilterTenant] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");

  // Bulk payment
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({ paid_at: format(new Date(), "yyyy-MM-dd"), bank_account_id: "" });

  // Receipt
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Single payment mark
  const [markOpen, setMarkOpen] = useState<Payment | null>(null);
  const [markForm, setMarkForm] = useState({ paid_at: format(new Date(), "yyyy-MM-dd"), bank_account_id: "" });

  // Expense
  const [expOpen, setExpOpen] = useState(false);
  const [expForm, setExpForm] = useState({ description: "", category: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), bank_account_id: "", notes: "" });

  // Charge (lançamento)
  const [chargeOpen, setChargeOpen] = useState(false);
  const [chargeForm, setChargeForm] = useState({ tenant_id: "", description: "", quantity: "1", unit_price: "", notes: "", date: format(new Date(), "yyyy-MM-dd") });
  const [filterChargesTenant, setFilterChargesTenant] = useState("all");

  const [saving, setSaving] = useState(false);
  const [dreMonth, setDreMonth] = useState(format(new Date(), "yyyy-MM"));

  const fetchAll = async () => {
    supabase.from("payments")
      .select("id, amount, due_date, paid_at, status, notes, bank_account:bank_accounts(name), booking:bookings(date, period, tenant:tenants(id, name), room:rooms(name))")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPayments(data as Payment[]); });

    supabase.from("expenses")
      .select("id, description, category, amount, date, notes, bank_account:bank_accounts(name)")
      .order("date", { ascending: false })
      .then(({ data }) => { if (data) setExpenses(data as Expense[]); });

    supabase.from("bank_accounts").select("id, name").eq("active", true)
      .then(({ data }) => { if (data) setBankAccounts(data); });

    supabase.from("tenants").select("id, name").eq("active", true).order("name")
      .then(({ data }) => { if (data) setTenants(data); });

    supabase.from("tenant_charges")
      .select("id, tenant_id, description, quantity, unit_price, amount, date, status, paid_at, notes, tenant:tenants(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setCharges(data as TenantCharge[]); });

    supabase.from("app_settings").select("value").eq("key", "whatsapp_number").single()
      .then(({ data }) => { if (data?.value) setWhatsapp(data.value); });
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredPayments = payments.filter(p => {
    if (filterTenant !== "all" && p.booking?.tenant?.id !== filterTenant) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterMonth && p.booking?.date && !p.booking.date.startsWith(filterMonth)) return false;
    return true;
  });

  const filteredCharges = filterChargesTenant === "all"
    ? charges
    : charges.filter(c => c.tenant_id === filterChargesTenant);

  // Contas a receber — group pending by tenant
  const pendingByTenant: Record<string, { name: string; payments: Payment[]; charges: TenantCharge[] }> = {};
  payments.filter(p => p.status !== "paid").forEach(p => {
    const tid = p.booking?.tenant?.id ?? "unknown";
    const name = p.booking?.tenant?.name ?? "—";
    if (!pendingByTenant[tid]) pendingByTenant[tid] = { name, payments: [], charges: [] };
    pendingByTenant[tid].payments.push(p);
  });
  charges.filter(c => c.status === "pending").forEach(c => {
    const tid = c.tenant_id;
    const name = c.tenant?.name ?? "—";
    if (!pendingByTenant[tid]) pendingByTenant[tid] = { name, payments: [], charges: [] };
    pendingByTenant[tid].charges.push(c);
  });

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

    const room = markOpen.booking?.room?.name ?? "";
    const d = markOpen.booking?.date ? format(new Date(markOpen.booking.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : "";
    const period = PERIOD_LABELS[markOpen.booking?.period ?? ""] ?? "";
    setReceiptData({
      tenantName: markOpen.booking?.tenant?.name ?? "",
      paidAt: markForm.paid_at,
      items: [{ label: `${room} · ${d} · ${period}`, amount: markOpen.amount }],
      total: markOpen.amount,
    });
    setReceiptOpen(true);
    setMarkOpen(null);
    fetchAll();
    toast.success("Pagamento marcado como pago.");
  };

  const handleBulkPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPayments.length === 0) return;
    setSaving(true);
    const { error } = await supabase.from("payments").update({
      status: "paid",
      paid_at: bulkForm.paid_at,
      bank_account_id: bulkForm.bank_account_id || null,
    }).in("id", selectedPayments);
    setSaving(false);
    if (error) { toast.error("Erro ao quitar pagamentos."); return; }

    const paidItems = payments.filter(p => selectedPayments.includes(p.id));
    const items = paidItems.map(p => {
      const room = p.booking?.room?.name ?? "";
      const d = p.booking?.date ? format(new Date(p.booking.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : "";
      const period = PERIOD_LABELS[p.booking?.period ?? ""] ?? "";
      return { label: `${room} · ${d} · ${period}`, amount: p.amount };
    });
    setReceiptData({
      tenantName: paidItems[0]?.booking?.tenant?.name ?? "",
      paidAt: bulkForm.paid_at,
      items,
      total: items.reduce((s, i) => s + i.amount, 0),
    });
    setReceiptOpen(true);
    setBulkOpen(false);
    setSelectedPayments([]);
    fetchAll();
    toast.success(`${paidItems.length} pagamento(s) quitado(s).`);
  };

  const togglePayment = (id: string) => {
    setSelectedPayments(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(chargeForm.quantity) || 1;
    const unitPrice = parseFloat(chargeForm.unit_price.replace(",", ".")) || 0;
    if (!chargeForm.tenant_id || !chargeForm.description || unitPrice <= 0) {
      toast.error("Preencha locador, item e preço.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("tenant_charges").insert({
      tenant_id: chargeForm.tenant_id,
      description: chargeForm.description.trim(),
      quantity: qty,
      unit_price: unitPrice,
      amount: qty * unitPrice,
      date: chargeForm.date,
      notes: chargeForm.notes.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao registrar lançamento."); return; }
    toast.success("Lançamento registrado.");
    setChargeOpen(false);
    setChargeForm({ tenant_id: "", description: "", quantity: "1", unit_price: "", notes: "", date: format(new Date(), "yyyy-MM-dd") });
    fetchAll();
  };

  const handleMarkChargePaid = async (charge: TenantCharge) => {
    const { error } = await supabase.from("tenant_charges").update({
      status: "paid",
      paid_at: new Date().toISOString(),
    }).eq("id", charge.id);
    if (error) { toast.error("Erro ao marcar como pago."); return; }
    setReceiptData({
      tenantName: charge.tenant?.name ?? "",
      paidAt: format(new Date(), "yyyy-MM-dd"),
      items: [{ label: `${charge.description}${charge.quantity > 1 ? ` x${charge.quantity}` : ""}`, amount: charge.amount }],
      total: charge.amount,
    });
    setReceiptOpen(true);
    fetchAll();
    toast.success("Lançamento marcado como pago.");
  };

  // DRE
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
        <TabsList className="bg-surface border border-border mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="recebimentos" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Recebimentos</TabsTrigger>
          <TabsTrigger value="lancamentos" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Lançamentos</TabsTrigger>
          <TabsTrigger value="contas" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Contas a Receber</TabsTrigger>
          <TabsTrigger value="despesas" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Despesas</TabsTrigger>
          <TabsTrigger value="dre" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">DRE</TabsTrigger>
        </TabsList>

        {/* RECEBIMENTOS */}
        <TabsContent value="recebimentos">
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <Select value={filterTenant} onValueChange={setFilterTenant}>
              <SelectTrigger className="bg-surface border-border font-inter text-sm w-48"><SelectValue placeholder="Todos os locadores" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-inter text-sm">Todos os locadores</SelectItem>
                {tenants.map(t => <SelectItem key={t.id} value={t.id} className="font-inter text-sm">{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-surface border-border font-inter text-sm w-36"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-inter text-sm">Todos</SelectItem>
                <SelectItem value="pending" className="font-inter text-sm">Pendentes</SelectItem>
                <SelectItem value="paid" className="font-inter text-sm">Pagos</SelectItem>
                <SelectItem value="overdue" className="font-inter text-sm">Atrasados</SelectItem>
              </SelectContent>
            </Select>
            <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-surface border-border font-inter text-sm w-44" />
            {filterMonth && (
              <Button variant="ghost" size="sm" onClick={() => setFilterMonth("")} className="text-xs font-inter text-muted-foreground h-8">Limpar</Button>
            )}
            {selectedPayments.length > 0 && (
              <Button size="sm" onClick={() => setBulkOpen(true)} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs ml-auto">
                Quitar selecionados ({selectedPayments.length})
              </Button>
            )}
          </div>
          <div className="border border-border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-xs font-inter">Locador</TableHead>
                  <TableHead className="text-xs font-inter hidden md:table-cell">Sala / Data</TableHead>
                  <TableHead className="text-xs font-inter">Valor</TableHead>
                  <TableHead className="text-xs font-inter">Status</TableHead>
                  <TableHead className="text-xs font-inter hidden lg:table-cell">Conta</TableHead>
                  <TableHead className="text-xs font-inter"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p) => (
                  <TableRow key={p.id} className="border-border hover:bg-surface/50">
                    <TableCell>
                      {p.status === "pending" && (
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(p.id)}
                          onChange={() => togglePayment(p.id)}
                          className="h-3.5 w-3.5 cursor-pointer accent-lima"
                        />
                      )}
                    </TableCell>
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
                          variant="ghost" size="sm"
                          className="text-xs font-inter text-lima hover:bg-lima/10 h-7"
                          onClick={() => { setMarkOpen(p); setMarkForm({ paid_at: format(new Date(), "yyyy-MM-dd"), bank_account_id: "" }); }}
                        >
                          Marcar pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10 font-inter">Nenhum recebimento.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* LANÇAMENTOS */}
        <TabsContent value="lancamentos">
          <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
            <Select value={filterChargesTenant} onValueChange={setFilterChargesTenant}>
              <SelectTrigger className="bg-surface border-border font-inter text-sm w-48"><SelectValue placeholder="Todos os locadores" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-inter text-sm">Todos os locadores</SelectItem>
                {tenants.map(t => <SelectItem key={t.id} value={t.id} className="font-inter text-sm">{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setChargeOpen(true)} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-2">
              <Plus className="h-3 w-3" /> Novo Lançamento
            </Button>
          </div>
          <div className="border border-border rounded overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-inter">Locador</TableHead>
                  <TableHead className="text-xs font-inter">Item</TableHead>
                  <TableHead className="text-xs font-inter hidden md:table-cell">Qtd</TableHead>
                  <TableHead className="text-xs font-inter">Total</TableHead>
                  <TableHead className="text-xs font-inter hidden md:table-cell">Data</TableHead>
                  <TableHead className="text-xs font-inter">Status</TableHead>
                  <TableHead className="text-xs font-inter"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.map(c => (
                  <TableRow key={c.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-sm font-inter">{c.tenant?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm font-inter">{c.description}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter hidden md:table-cell">{c.quantity}</TableCell>
                    <TableCell className="text-sm font-inter font-medium">{fmt(c.amount)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter hidden md:table-cell">
                      {format(new Date(c.date + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-inter ${c.status === "paid" ? "border-green-500/30 text-green-400" : "border-yellow-500/30 text-yellow-400"}`}>
                        {c.status === "paid" ? "Pago" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.status === "pending" && (
                        <Button variant="ghost" size="sm" className="text-xs font-inter text-lima hover:bg-lima/10 h-7" onClick={() => handleMarkChargePaid(c)}>
                          Marcar pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCharges.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10 font-inter">Nenhum lançamento.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* CONTAS A RECEBER */}
        <TabsContent value="contas">
          {Object.keys(pendingByTenant).length === 0 ? (
            <p className="text-sm text-muted-foreground font-inter py-10 text-center">Nenhuma conta pendente.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(pendingByTenant).map(([tid, group]) => {
                const total = group.payments.reduce((s, p) => s + p.amount, 0) + group.charges.reduce((s, c) => s + c.amount, 0);
                return (
                  <div key={tid} className="border border-border rounded p-5 bg-surface">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div>
                        <p className="font-barlow font-bold text-base">{group.name}</p>
                        <p className="text-xs text-muted-foreground font-inter mt-0.5">
                          Total pendente: <span className="text-lima font-semibold">{fmt(total)}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm" variant="outline"
                          className="border-border font-inter text-xs gap-1.5 h-8"
                          onClick={() => openPrint(buildContasReceberHtml(group.name, group.payments, group.charges), `Conta a Receber — ${group.name}`)}
                        >
                          <Printer className="h-3 w-3" /> Imprimir
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10 font-inter text-xs gap-1.5 h-8"
                          onClick={() => window.open(buildContasReceberWA(group.name, group.payments, group.charges, whatsapp), "_blank")}
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </Button>
                      </div>
                    </div>
                    {group.payments.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider mb-2">Reservas</p>
                        {group.payments.map(p => (
                          <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                            <span className="text-xs font-inter text-muted-foreground">
                              {p.booking?.room?.name} · {p.booking?.date ? format(new Date(p.booking.date + "T12:00:00"), "dd/MM", { locale: ptBR }) : ""} · {PERIOD_LABELS[p.booking?.period ?? ""] ?? ""}
                            </span>
                            <span className="text-xs font-inter font-medium">{fmt(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {group.charges.length > 0 && (
                      <div>
                        <p className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider mb-2">Extras</p>
                        {group.charges.map(c => (
                          <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                            <span className="text-xs font-inter text-muted-foreground">
                              {c.description}{c.quantity > 1 ? ` x${c.quantity}` : ""}
                            </span>
                            <span className="text-xs font-inter font-medium">{fmt(c.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
              <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-4 w-4 text-lima" /><span className="text-xs text-muted-foreground font-inter">Receita bruta</span></div>
              <p className="text-2xl font-barlow font-bold text-lima">{fmt(totalRevenue)}</p>
            </div>
            <div className="border border-border bg-surface rounded p-5">
              <div className="flex items-center gap-2 mb-2"><TrendingDown className="h-4 w-4 text-red-400" /><span className="text-xs text-muted-foreground font-inter">Total despesas</span></div>
              <p className="text-2xl font-barlow font-bold text-red-400">{fmt(totalExpenses)}</p>
            </div>
            <div className={`border rounded p-5 ${result >= 0 ? "border-lima/30 bg-lima/5" : "border-red-500/30 bg-red-500/5"}`}>
              <div className="flex items-center gap-2 mb-2"><span className="text-xs text-muted-foreground font-inter">Resultado</span></div>
              <p className={`text-2xl font-barlow font-bold ${result >= 0 ? "text-lima" : "text-red-400"}`}>{fmt(result)}</p>
            </div>
          </div>
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

      {/* Mark single paid */}
      <Dialog open={!!markOpen} onOpenChange={(o) => !o && setMarkOpen(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="font-barlow font-bold">Marcar como Pago</DialogTitle></DialogHeader>
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

      {/* Bulk pay */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="font-barlow font-bold">Quitar {selectedPayments.length} Pagamento(s)</DialogTitle></DialogHeader>
          <form onSubmit={handleBulkPay} className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground font-inter">
              Total: <span className="text-foreground font-medium">
                {fmt(payments.filter(p => selectedPayments.includes(p.id)).reduce((s, p) => s + p.amount, 0))}
              </span>
            </p>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Data do pagamento</label>
              <Input type="date" value={bulkForm.paid_at} onChange={(e) => setBulkForm({ ...bulkForm, paid_at: e.target.value })} className="bg-background border-border font-inter text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Conta onde entrou</label>
              <Select value={bulkForm.bank_account_id} onValueChange={(v) => setBulkForm({ ...bulkForm, bank_account_id: v })}>
                <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar conta" /></SelectTrigger>
                <SelectContent>{bankAccounts.map((a) => <SelectItem key={a.id} value={a.id} className="font-inter text-sm">{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm">
              {saving ? "Quitando..." : `Quitar ${selectedPayments.length} pagamento(s)`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add expense */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-barlow font-bold">Nova Despesa</DialogTitle></DialogHeader>
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

      {/* Add charge (lançamento) */}
      <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-barlow font-bold">Novo Lançamento</DialogTitle></DialogHeader>
          <form onSubmit={handleAddCharge} className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Locador *</label>
              <Select value={chargeForm.tenant_id} onValueChange={(v) => setChargeForm({ ...chargeForm, tenant_id: v })}>
                <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar locador" /></SelectTrigger>
                <SelectContent>{tenants.map(t => <SelectItem key={t.id} value={t.id} className="font-inter text-sm">{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Item *</label>
              <Select value={chargeForm.description} onValueChange={(v) => {
                const item = ITEMS_PADRAO.find(i => i.label === v);
                setChargeForm({ ...chargeForm, description: v, unit_price: item && item.price > 0 ? item.price.toFixed(2).replace(".", ",") : chargeForm.unit_price });
              }}>
                <SelectTrigger className="bg-background border-border font-inter text-sm"><SelectValue placeholder="Selecionar item" /></SelectTrigger>
                <SelectContent>{ITEMS_PADRAO.map(i => <SelectItem key={i.label} value={i.label} className="font-inter text-sm">{i.label}{i.price > 0 ? ` — ${fmt(i.price)}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Quantidade</label>
                <Input type="number" min="1" value={chargeForm.quantity} onChange={(e) => setChargeForm({ ...chargeForm, quantity: e.target.value })} className="bg-background border-border font-inter text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Preço unitário (R$) *</label>
                <Input value={chargeForm.unit_price} onChange={(e) => setChargeForm({ ...chargeForm, unit_price: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="0,00" />
              </div>
            </div>
            {chargeForm.unit_price && chargeForm.quantity && (
              <p className="text-xs text-muted-foreground font-inter">
                Total: <span className="text-foreground font-medium">
                  {fmt((parseInt(chargeForm.quantity) || 0) * (parseFloat(chargeForm.unit_price.replace(",", ".")) || 0))}
                </span>
              </p>
            )}
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Data</label>
              <Input type="date" value={chargeForm.date} onChange={(e) => setChargeForm({ ...chargeForm, date: e.target.value })} className="bg-background border-border font-inter text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Observações</label>
              <Input value={chargeForm.notes} onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="Opcional..." />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm">
              {saving ? "Salvando..." : "Registrar lançamento"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receipt modal */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="font-barlow font-bold">Recibo</DialogTitle></DialogHeader>
          {receiptData && (
            <div className="mt-2 space-y-4">
              <div className="border border-border rounded p-4 space-y-2 bg-background">
                <p className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider">Pedrosa Santé · Recibo de Pagamento</p>
                <div className="flex justify-between text-sm font-inter pt-1">
                  <span className="text-muted-foreground">Locador</span>
                  <span className="font-medium">{receiptData.tenantName}</span>
                </div>
                <div className="flex justify-between text-sm font-inter">
                  <span className="text-muted-foreground">Data</span>
                  <span>{format(new Date(receiptData.paidAt + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
                <div className="border-t border-border pt-2 space-y-1.5">
                  {receiptData.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-inter">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span>{fmt(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-barlow font-bold text-sm">
                  <span>Total pago</span>
                  <span className="text-lima">{fmt(receiptData.total)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm" variant="outline"
                  className="flex-1 border-border font-inter text-xs gap-1.5"
                  onClick={() => openPrint(buildReceiptHtml(receiptData), `Recibo — ${receiptData.tenantName}`)}
                >
                  <Printer className="h-3 w-3" /> Imprimir / PDF
                </Button>
                <Button
                  size="sm" variant="outline"
                  className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 font-inter text-xs gap-1.5"
                  onClick={() => window.open(buildReceiptWA(receiptData, whatsapp), "_blank")}
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setReceiptOpen(false)} className="w-full font-inter text-xs text-muted-foreground">
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinanceiro;
