import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, ClipboardList, LogOut } from "lucide-react";

const links = [
  { to: "/locador/agenda", label: "Solicitar Reserva", icon: CalendarDays },
  { to: "/locador/reservas", label: "Minhas Reservas", icon: ClipboardList },
];

const LocadorLayout = () => {
  const [loading, setLoading] = useState(true);
  const [tenantName, setTenantName] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/locador/login");
        return;
      }
      // Verify user is a tenant (not admin)
      const { data: tenant } = await supabase
        .from("tenants")
        .select("name, active")
        .eq("user_id", session.user.id)
        .single();

      if (!tenant) {
        // Not a tenant — redirect to admin
        navigate("/admin/dashboard");
        return;
      }
      if (!tenant.active) {
        await supabase.auth.signOut();
        navigate("/locador/login");
        return;
      }
      setTenantName(tenant.name);
      setLoading(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/locador/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm font-inter">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-background hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <p className="font-barlow text-xs font-light tracking-[0.3em] uppercase mb-1">
            PEDROSA<span className="font-bold">SANTÉ</span>
          </p>
          <p className="text-xs text-muted-foreground font-inter truncate">Portal do Locador</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-inter rounded transition-colors ${
                pathname === l.to
                  ? "bg-lima/10 text-lima"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground font-inter px-3 mb-2 truncate">{tenantName}</p>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/locador/login"); }}
            className="flex items-center gap-3 px-3 py-2 text-xs font-inter text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-4 p-4 border-b border-border overflow-x-auto">
          <span className="font-barlow text-xs font-light tracking-[0.2em] uppercase shrink-0">
            PEDROSA<span className="font-bold">SANTÉ</span>
          </span>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-inter whitespace-nowrap ${pathname === l.to ? "text-lima" : "text-muted-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/locador/login"); }}
            className="text-xs font-inter text-muted-foreground ml-auto whitespace-nowrap"
          >
            Sair
          </button>
        </div>
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LocadorLayout;
