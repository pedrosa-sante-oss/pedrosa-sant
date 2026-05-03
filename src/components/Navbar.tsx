import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/quem-somos", label: "Quem Somos" },
    { to: "/espacos", label: "Os Espaços" },
    { to: "/para-voce", label: "Para Você" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/">
          <img src={logoWhite} alt="Pedrosa Santé" className="h-5 md:h-6" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-inter transition-colors hover:text-foreground ${
                pathname === l.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/contato">
            <Button variant="outline" size="sm" className="border-lima text-lima hover:bg-lima hover:text-primary-foreground font-inter text-xs tracking-wider">
              Tenho Interesse
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-6 pt-4 space-y-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-sm font-inter text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link to="/contato" onClick={() => setOpen(false)}>
            <Button variant="outline" size="sm" className="border-lima text-lima hover:bg-lima hover:text-primary-foreground w-full font-inter text-xs tracking-wider">
              Tenho Interesse
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
