import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/conteudo", label: "Conteúdo", icon: FileText },
];

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/admin/login");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground text-sm">Carregando...</p></div>;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-background hidden md:flex flex-col">
        <div className="p-6">
          <p className="font-barlow text-xs font-light tracking-[0.3em] uppercase">PEDROSA<span className="font-bold">SANTÉ</span></p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-inter rounded transition-colors ${
                pathname === l.to ? "bg-lima/10 text-lima" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
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
          {links.map((l) => (
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
