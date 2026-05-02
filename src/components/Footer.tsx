import { Instagram } from "lucide-react";

const Footer = () => (
  <footer className="bg-surface-dark border-t border-border">
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-barlow text-sm font-light tracking-[0.35em] uppercase">
          PEDROSA<span className="font-bold">SANTÉ</span>
        </p>
        <a
          href="https://instagram.com/pedrosasante"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Instagram className="h-4 w-4" />
          @pedrosasante
        </a>
        <p className="text-xs text-muted-foreground">© 2025 Pedrosa Santé. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
