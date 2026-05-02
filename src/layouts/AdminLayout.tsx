import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Users, FileText, LogOut,
  ImageIcon, CalendarDays, ClipboardList, UserCheck,
  DollarSign, Settings, Minus,
} from "lucide-react";

const mainLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Users },
];

const erpLinks = [
  { to: "/admin/salas", label: "Salas", icon: ImageIcon },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/admin/reservas", label: "Reservas", icon: ClipboardList },
  { to: "/admin/locadores", label: "Locadores", icon: UserCheck },
  { to: "/admin/financeiro", label: "Financeiro", icon: DollarSign },
];

const systemLinks = [
  { to: "/admin/conteudo", label: "Conteúdo do Site", icon: FileText },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      // If user is a tenant, redirect to tenant portal
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (tenant) {
        navigate("/locador/agenda");
        return;
      }
      setLoading(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  const allLinks = [...mainLinks, ...erpLinks, ...systemLinks];

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 text-xs font-inter rounded transition-colors ${
        pathname === to ? "bg-lima/10 text-lima" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-background hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <p className="font-barlow text-xs font-light tracking-[0.3em] uppercase">
            PEDROSA<span className="font-bold">SANTÉ</span>
          </p>
          <p className="text-[10px] text-muted-foreground font-inter mt-1">Painel Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainLinks.map((l) => <NavLink key={l.to} {...l} />)}

          <div className="flex items-center gap-2 px-3 py-2">
            <Minus className="h-3 w-3 text-border" />
            <span className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider">Locação</span>
          </div>

          {erpLinks.map((l) => <NavLink key={l.to} {...l} />)}

          <div className="flex items-center gap-2 px-3 py-2">
            <Minus className="h-3 w-3 text-border" />
            <span className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider">Sistema</span>
          </div>

          {systemLinks.map((l) => <NavLink key={l.to} {...l} />)}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }}
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
          {allLinks.map((l) => (
            <Link key={l.to} to={l.to} className={`text-xs font-inter whitespace-nowrap ${pathname === l.to ? "text-lima" : "text-muted-foreground"}`}>
              {l.label}
            </Link>
          ))}
          <button onClick={async () => { await supabase.auth.signOut(); navigate("/admin/login"); }} className="text-xs font-inter text-muted-foreground ml-auto whitespace-nowrap">Sair</button>
        </div>
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
