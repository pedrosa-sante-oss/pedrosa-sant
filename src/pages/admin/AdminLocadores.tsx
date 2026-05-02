import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Link2, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  active: boolean;
  invite_token: string;
  user_id: string | null;
  notes: string | null;
  created_at: string;
}

const EMPTY_FORM = { name: "", email: "", phone: "", specialty: "", notes: "" };

const AdminLocadores = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    const { data } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
    if (data) setTenants(data);
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error("Nome e e-mail são obrigatórios."); return; }
    setSaving(true);
    const { error } = await supabase.from("tenants").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      specialty: form.specialty.trim() || null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.code === "23505" ? "E-mail já cadastrado." : "Erro ao criar locador.");
      return;
    }
    toast.success("Locador criado. Copie e envie o link de convite.");
    setForm(EMPTY_FORM);
    setOpen(false);
    fetchTenants();
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const toggleActive = async (tenant: Tenant) => {
    const { error } = await supabase
      .from("tenants")
      .update({ active: !tenant.active })
      .eq("id", tenant.id);
    if (error) { toast.error("Erro ao atualizar."); return; }
    toast.success(tenant.active ? "Locador desativado." : "Locador reativado.");
    fetchTenants();
    if (selected?.id === tenant.id) setSelected({ ...tenant, active: !tenant.active });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-barlow font-bold text-xl">Locadores</h1>
          <p className="text-xs text-muted-foreground font-inter mt-1">
            Crie o cadastro e envie o link de convite para o locador criar sua senha.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-2"
        >
          <Plus className="h-3 w-3" />
          Novo Locador
        </Button>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-inter">Nome</TableHead>
              <TableHead className="text-xs font-inter hidden md:table-cell">Especialidade</TableHead>
              <TableHead className="text-xs font-inter hidden lg:table-cell">Telefone</TableHead>
              <TableHead className="text-xs font-inter">Acesso</TableHead>
              <TableHead className="text-xs font-inter">Status</TableHead>
              <TableHead className="text-xs font-inter">Convite</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => (
              <TableRow
                key={t.id}
                className="border-border cursor-pointer hover:bg-surface/50"
                onClick={() => setSelected(t)}
              >
                <TableCell className="text-sm font-inter">{t.name}</TableCell>
                <TableCell className="text-sm font-inter hidden md:table-cell">{t.specialty ?? "—"}</TableCell>
                <TableCell className="text-sm font-inter hidden lg:table-cell">{t.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-inter ${t.user_id ? "border-green-500/30 text-green-400" : "border-border text-muted-foreground"}`}>
                    {t.user_id ? "Ativo" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-inter ${t.active ? "border-lima/30 text-lima" : "border-border text-muted-foreground"}`}>
                    {t.active ? "Habilitado" : "Bloqueado"}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyInviteLink(t.invite_token)}
                    title="Copiar link de convite"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10 font-inter">
                  Nenhum locador cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="font-barlow font-bold">Novo Locador</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleCreate} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Nome *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="Dr. João Silva" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">E-mail *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="joao@email.com" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Telefone / WhatsApp</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="(87) 99999-9999" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Especialidade</label>
              <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="Odontologia" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-inter block mb-1">Observações</label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background border-border font-inter text-sm" placeholder="Notas internas..." />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm">
              {saving ? "Salvando..." : "Criar Locador"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-card border-border">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-barlow font-bold">{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm font-inter">
                <div><span className="text-muted-foreground">E-mail:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">Telefone:</span> {selected.phone ?? "—"}</div>
                <div><span className="text-muted-foreground">Especialidade:</span> {selected.specialty ?? "—"}</div>
                {selected.notes && <div><span className="text-muted-foreground">Notas:</span> {selected.notes}</div>}
                <div><span className="text-muted-foreground">Cadastrado em:</span> {new Date(selected.created_at).toLocaleDateString("pt-BR")}</div>
                <div className="pt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-border font-inter text-xs"
                    onClick={() => copyInviteLink(selected.invite_token)}
                  >
                    <Link2 className="h-3 w-3" />
                    Copiar link de convite
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full gap-2 font-inter text-xs ${selected.active ? "border-red-500/30 text-red-400 hover:bg-red-500/10" : "border-lima/30 text-lima hover:bg-lima/10"}`}
                    onClick={() => toggleActive(selected)}
                  >
                    {selected.active ? <><UserX className="h-3 w-3" /> Bloquear acesso</> : <><UserCheck className="h-3 w-3" /> Habilitar acesso</>}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLocadores;
