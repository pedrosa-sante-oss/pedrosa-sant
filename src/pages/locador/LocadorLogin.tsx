import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LocadorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error("E-mail ou senha inválidos.");
      return;
    }
    // Check if user is a tenant
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, active")
      .eq("user_id", data.user.id)
      .single();

    setLoading(false);

    if (!tenant) {
      await supabase.auth.signOut();
      toast.error("Acesso não autorizado neste portal.");
      return;
    }
    if (!tenant.active) {
      await supabase.auth.signOut();
      toast.error("Seu acesso está bloqueado. Entre em contato com a secretaria.");
      return;
    }
    navigate("/locador/agenda");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-barlow text-sm font-light tracking-[0.35em] uppercase mb-2">
            PEDROSA<span className="font-bold">SANTÉ</span>
          </p>
          <p className="text-xs text-muted-foreground font-inter">Portal do Locador</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-surface border-border h-12 font-inter"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface border-border h-12 font-inter"
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-lima text-primary-foreground hover:bg-lima/90 h-12 font-inter font-semibold text-sm"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground font-inter mt-6">
          É admin?{" "}
          <Link to="/admin/login" className="text-lima hover:underline">
            Acesso administrativo
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LocadorLogin;
