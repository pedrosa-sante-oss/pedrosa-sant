import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Minus } from "lucide-react";

interface ConsumableItem {
  id: string;
  name: string;
  price: number;
  active: boolean;
}
interface Tenant { id: string; name: string; }

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const AdminConsumo = () => {
  const [items, setItems] = useState<ConsumableItem[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [saving, setSaving] = useState(false);

  // Cardápio — add form
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Cardápio — inline price edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");

  // Lançar Consumo
  const [selectedTenant, setSelectedTenant] = useState("");
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const fetchAll = () => {
    supabase.from("consumable_items").select("id, name, price, active").order("name")
      .then(({ data }) => { if (data) setItems(data as ConsumableItem[]); });
    supabase.from("tenants").select("id, name").eq("active", true).order("name")
      .then(({ data }) => { if (data) setTenants(data); });
  };

  useEffect(() => { fetchAll(); }, []);

  const activeItems = items.filter(i => i.active);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const price = parseFloat(newPrice.replace(",", "."));
    if (!name || isNaN(price) || price < 0) { toast.error("Preencha nome e preço válidos"); return; }
    setSaving(true);
    const { error } = await supabase.from("consumable_items").insert({ name, price });
    setSaving(false);
    if (error) { toast.error("Erro ao adicionar item"); return; }
    toast.success("Item adicionado");
    setNewName("");
    setNewPrice("");
    fetchAll();
  };

  const handleToggleActive = async (item: ConsumableItem) => {
    const { error } = await supabase.from("consumable_items").update({ active: !item.active }).eq("id", item.id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    fetchAll();
  };

  const startEdit = (item: ConsumableItem) => {
    setEditingId(item.id);
    setEditingPrice(item.price.toFixed(2).replace(".", ","));
  };

  const saveEditPrice = async (id: string) => {
    const price = parseFloat(editingPrice.replace(",", "."));
    if (isNaN(price) || price < 0) { toast.error("Preço inválido"); return; }
    const { error } = await supabase.from("consumable_items").update({ price }).eq("id", id);
    setEditingId(null);
    if (error) { toast.error("Erro ao salvar preço"); return; }
    toast.success("Preço atualizado");
    fetchAll();
  };

  const adjustQty = (id: string, delta: number) => {
    setQtys(prev => {
      const cur = prev[id] ?? 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  };

  const total = activeItems.reduce((sum, item) => sum + (qtys[item.id] ?? 0) * item.price, 0);
  const hasItems = activeItems.some(item => (qtys[item.id] ?? 0) > 0);

  const handleRegistrar = async () => {
    if (!selectedTenant || !hasItems) return;
    setSaving(true);
    const today = format(new Date(), "yyyy-MM-dd");
    const inserts = activeItems
      .filter(item => (qtys[item.id] ?? 0) > 0)
      .map(item => ({
        tenant_id: selectedTenant,
        description: item.name,
        quantity: qtys[item.id],
        unit_price: item.price,
        amount: qtys[item.id] * item.price,
        date: today,
      }));
    const { error } = await supabase.from("tenant_charges").insert(inserts);
    setSaving(false);
    if (error) { toast.error("Erro ao registrar consumo"); return; }
    toast.success(`${inserts.length} item(ns) registrado(s) com sucesso`);
    setSelectedTenant("");
    setQtys({});
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-barlow font-bold text-2xl">Consumo</h1>
        <p className="text-sm text-muted-foreground font-inter mt-1">Cardápio de itens e lançamento de consumo por locador</p>
      </div>

      <Tabs defaultValue="cardapio">
        <TabsList className="mb-6">
          <TabsTrigger value="cardapio" className="font-inter text-xs">Cardápio</TabsTrigger>
          <TabsTrigger value="lancar" className="font-inter text-xs">Lançar Consumo</TabsTrigger>
        </TabsList>

        {/* ── CARDÁPIO ── */}
        <TabsContent value="cardapio">
          <form onSubmit={handleAdd} className="flex gap-3 mb-6 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-inter block mb-1">Nome do item</label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Suco de laranja"
                className="bg-background border-border font-inter text-sm"
              />
            </div>
            <div className="w-36">
              <label className="text-xs text-muted-foreground font-inter block mb-1">Preço (R$)</label>
              <Input
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder="0,00"
                className="bg-background border-border font-inter text-sm"
              />
            </div>
            <Button type="submit" disabled={saving} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </form>

          <div className="border border-border rounded">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-inter text-xs text-muted-foreground">Nome</TableHead>
                  <TableHead className="font-inter text-xs text-muted-foreground">Preço</TableHead>
                  <TableHead className="font-inter text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="font-inter text-xs text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground font-inter py-8">
                      Nenhum item cadastrado
                    </TableCell>
                  </TableRow>
                )}
                {items.map(item => (
                  <TableRow key={item.id} className="border-border">
                    <TableCell className="font-inter text-sm">{item.name}</TableCell>
                    <TableCell className="font-inter text-sm">
                      {editingId === item.id ? (
                        <Input
                          autoFocus
                          value={editingPrice}
                          onChange={e => setEditingPrice(e.target.value)}
                          onBlur={() => saveEditPrice(item.id)}
                          onKeyDown={e => { if (e.key === "Enter") saveEditPrice(item.id); if (e.key === "Escape") setEditingId(null); }}
                          className="bg-background border-border font-inter text-sm h-7 w-24 px-2"
                        />
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="text-left hover:text-lima transition-colors tabular-nums"
                          title="Clique para editar"
                        >
                          {fmt(item.price)}
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.active ? "border-green-500/30 text-green-400" : "border-border text-muted-foreground"}>
                        {item.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(item)}
                        className="text-xs font-inter text-muted-foreground hover:text-foreground h-7 px-2"
                      >
                        {item.active ? "Desativar" : "Ativar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground font-inter mt-3">Clique no preço para editar inline. Enter para salvar, Esc para cancelar.</p>
        </TabsContent>

        {/* ── LANÇAR CONSUMO ── */}
        <TabsContent value="lancar">
          <div className="max-w-xl space-y-6">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Locador *</label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger className="bg-background border-border font-inter text-sm">
                  <SelectValue placeholder="Selecionar locador" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id} className="font-inter text-sm">{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeItems.length === 0 ? (
              <p className="text-sm text-muted-foreground font-inter">Nenhum item ativo no cardápio.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-inter uppercase tracking-widest mb-3">Itens</p>
                {activeItems.map(item => {
                  const qty = qtys[item.id] ?? 0;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-border bg-background">
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-sm font-medium truncate">{item.name}</p>
                        <p className="font-inter text-xs text-muted-foreground">{fmt(item.price)} / un</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => adjustQty(item.id, -1)}
                          disabled={qty === 0}
                          className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-inter text-sm tabular-nums">{qty}</span>
                        <button
                          onClick={() => adjustQty(item.id, 1)}
                          className="h-7 w-7 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {qty > 0 && (
                        <p className="font-inter text-sm font-medium tabular-nums w-20 text-right shrink-0">
                          {fmt(qty * item.price)}
                        </p>
                      )}
                    </div>
                  );
                })}

                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-inter text-sm text-muted-foreground">Total</span>
                  <span className="font-barlow font-bold text-lg">{fmt(total)}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleRegistrar}
              disabled={saving || !selectedTenant || !hasItems}
              className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm"
            >
              {saving ? "Registrando..." : "Registrar consumo"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminConsumo;
