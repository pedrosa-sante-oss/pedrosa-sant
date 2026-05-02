import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";

interface BankAccount { id: string; name: string; bank: string | null; active: boolean; }

const AdminConfiguracoes = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testing, setTesting] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankForm, setBankForm] = useState({ name: "", bank: "" });
  const [savingBank, setSavingBank] = useState(false);

  const fetchAll = async () => {
    const { data: settings } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["datacrazy_webhook_url", "datacrazy_api_key"]);

    if (settings) {
      setWebhookUrl(settings.find((s) => s.key === "datacrazy_webhook_url")?.value ?? "");
      setApiKey(settings.find((s) => s.key === "datacrazy_api_key")?.value ?? "");
    }

    const { data: accounts } = await supabase.from("bank_accounts").select("*").order("created_at");
    if (accounts) setBankAccounts(accounts);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    await supabase.from("app_settings").upsert([
      { key: "datacrazy_webhook_url", value: webhookUrl, updated_at: new Date().toISOString() },
      { key: "datacrazy_api_key", value: apiKey, updated_at: new Date().toISOString() },
    ]);
    setSavingWebhook(false);
    toast.success("Configurações de webhook salvas.");
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) { toast.error("Configure a URL do webhook primeiro."); return; }
    setTesting(true);
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          evento: "teste",
          mensagem: "Teste de webhook — Pedrosa Santé",
          timestamp: new Date().toISOString(),
        }),
      });
      toast.success(`Webhook disparado. Status: ${res.status}`);
    } catch {
      toast.error("Erro ao disparar webhook. Verifique a URL.");
    }
    setTesting(false);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.name) { toast.error("Nome da conta é obrigatório."); return; }
    setSavingBank(true);
    const { error } = await supabase.from("bank_accounts").insert({
      name: bankForm.name.trim(),
      bank: bankForm.bank.trim() || null,
    });
    setSavingBank(false);
    if (error) { toast.error("Erro ao adicionar conta."); return; }
    toast.success("Conta adicionada.");
    setBankForm({ name: "", bank: "" });
    fetchAll();
  };

  const toggleAccount = async (acc: BankAccount) => {
    const { error } = await supabase.from("bank_accounts").update({ active: !acc.active }).eq("id", acc.id);
    if (error) { toast.error("Erro ao atualizar."); return; }
    toast.success(acc.active ? "Conta desativada." : "Conta reativada.");
    fetchAll();
  };

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-6">Configurações</h1>

      <Tabs defaultValue="webhook">
        <TabsList className="bg-surface border border-border mb-6">
          <TabsTrigger value="webhook" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Webhook CRM</TabsTrigger>
          <TabsTrigger value="contas" className="text-xs font-inter data-[state=active]:bg-lima/10 data-[state=active]:text-lima">Contas Bancárias</TabsTrigger>
        </TabsList>

        {/* WEBHOOK */}
        <TabsContent value="webhook">
          <div className="max-w-lg">
            <p className="text-xs text-muted-foreground font-inter mb-6">
              Configure o webhook para receber pedidos de reserva no CRM Data Crazy. A URL e a chave são enviadas quando um locador faz um pedido.
            </p>
            <form onSubmit={handleSaveWebhook} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">URL do Webhook (Data Crazy)</label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-surface border-border font-inter text-sm"
                  placeholder="https://app.datacrazy.com/webhook/..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-inter block mb-1">Chave Secreta da API</label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-surface border-border font-inter text-sm"
                  placeholder="Chave Bearer..."
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={savingWebhook} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-sm font-semibold">
                  {savingWebhook ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={testing || !webhookUrl}
                  onClick={handleTestWebhook}
                  className="border-border font-inter text-sm gap-2"
                >
                  <Send className="h-3 w-3" />
                  {testing ? "Testando..." : "Testar webhook"}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-4 bg-surface border border-border rounded">
              <p className="text-xs font-barlow font-bold mb-2">Payload enviado</p>
              <pre className="text-[10px] text-muted-foreground font-mono leading-relaxed overflow-x-auto">{`{
  "evento": "pedido_reserva",
  "locador_nome": "Dr. João Silva",
  "locador_telefone": "5587999999999",
  "locador_especialidade": "Odontologia",
  "sala": "Sala Odontológica",
  "data": "2026-05-15",
  "periodo": "Dia todo",
  "origem": "Portal do Locador",
  "timestamp": "2026-05-02T14:30:00Z"
}`}</pre>
            </div>
          </div>
        </TabsContent>

        {/* CONTAS */}
        <TabsContent value="contas">
          <div className="max-w-lg mb-6">
            <form onSubmit={handleAddAccount} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-inter block mb-1">Nome da conta *</label>
                <Input
                  value={bankForm.name}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  className="bg-surface border-border font-inter text-sm"
                  placeholder="Nubank Emanuelle"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground font-inter block mb-1">Banco</label>
                <Input
                  value={bankForm.bank}
                  onChange={(e) => setBankForm({ ...bankForm, bank: e.target.value })}
                  className="bg-surface border-border font-inter text-sm"
                  placeholder="Nubank"
                />
              </div>
              <Button type="submit" disabled={savingBank} size="sm" className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-1 shrink-0">
                <Plus className="h-3 w-3" /> Adicionar
              </Button>
            </form>
          </div>

          <div className="border border-border rounded overflow-hidden max-w-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-inter">Conta</TableHead>
                  <TableHead className="text-xs font-inter">Banco</TableHead>
                  <TableHead className="text-xs font-inter">Status</TableHead>
                  <TableHead className="text-xs font-inter"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.map((a) => (
                  <TableRow key={a.id} className="border-border hover:bg-surface/50">
                    <TableCell className="text-sm font-inter">{a.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-inter">{a.bank ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-inter ${a.active ? "border-lima/30 text-lima" : "border-border text-muted-foreground"}`}>
                        {a.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-xs font-inter text-muted-foreground h-7" onClick={() => toggleAccount(a)}>
                        {a.active ? "Desativar" : "Ativar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {bankAccounts.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8 font-inter">Nenhuma conta cadastrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConfiguracoes;
