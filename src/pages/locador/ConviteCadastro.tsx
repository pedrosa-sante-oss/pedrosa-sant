import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ConviteCadastro = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!token) { setInvalid(true); setLoading(false); return; }
      const { data } = await supabase
        .from("tenants")
        .select("id, name, email, user_id")
        .eq("invite_token", token)
        .single();

      if (!data || data.user_id) {
        // Not found or already used
        setInvalid(true);
      } else {
        setTenant({ id: data.id, name: data.name, email: data.email });
      }
      setLoading(false);
    };
    check();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { toast.error("As senhas não conferem."); return; }
    if (!tenant) return;

    setSaving(true);

    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: tenant.email,
      password,
    });

    if (signUpError) {
      // If user already exists, try signing in and linking
      if (signUpError.message.includes("already registered")) {
        toast.error("Este e-mail já tem uma conta. Entre em contato com a secretaria.");
        setSaving(false);
        return;
      }
      toast.error("Erro ao criar conta: " + signUpError.message);
      setSaving(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      toast.error("Erro inesperado. Tente novamente.");
      setSaving(false);
      return;
    }

    // Link user_id to the tenant record
    const { error: updateError } = await supabase
      .from("tenants")
      .update({ user_id: userId })
      .eq("invite_token", token)
      .eq("id", tenant.id);

    setSaving(false);

    if (updateError) {
      toast.error("Conta criada, mas erro ao vincular perfil. Contate a secretaria.");
      return;
    }

    toast.success("Conta criada com sucesso! Bem-vindo(a).");
    navigate("/locador/agenda");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm font-inter">Verificando convite...</p>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <p className="font-barlow font-bold text-xl mb-2">Link inválido</p>
          <p className="text-muted-foreground text-sm font-inter">
            Este link de convite é inválido ou já foi utilizado. Entre em contato com a secretaria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-barlow text-sm font-light tracking-[0.35em] uppercase mb-2">
            PEDROSA<span className="font-bold">SANTÉ</span>
          </p>
          <p className="text-xs text-muted-foreground font-inter">Portal do Locador</p>
        </div>

        <div className="bg-surface border border-border rounded p-6 mb-6">
          <p className="text-xs text-muted-foreground font-inter mb-1">Bem-vindo(a),</p>
          <p className="font-barlow font-bold text-lg">{tenant?.name}</p>
          <p className="text-xs text-muted-foreground font-inter mt-1">{tenant?.email}</p>
        </div>

        <p className="text-sm font-inter text-muted-foreground mb-6">
          Crie uma senha para acessar o Portal do Locador da Pedrosa Santé.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Criar senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface border-border h-12 font-inter"
          />
          <Input
            type="password"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="bg-surface border-border h-12 font-inter"
          />
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-lima text-primary-foreground hover:bg-lima/90 h-12 font-inter font-semibold text-sm"
          >
            {saving ? "Criando conta..." : "Criar minha conta"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConviteCadastro;
