import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const specialties = ["Odontologia", "Medicina", "Psicologia", "Nutrição", "Fisioterapia", "Outra"];
const rooms = ["Sala 01", "Sala 02", "Sala 03", "Sala Odontológica", "Qualquer disponível"];

const Contato = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", specialty: "", room_interest: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.specialty) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      specialty: form.specialty,
      room_interest: form.room_interest || null,
      message: form.message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar. Tente novamente.");
    } else {
      toast.success("Mensagem enviada! Entraremos em contato em breve.");
      setForm({ name: "", email: "", phone: "", specialty: "", room_interest: "", message: "" });
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[40vh] items-center justify-center px-4 py-24">
        <span className="absolute text-[15rem] md:text-[25rem] font-barlow font-extrabold text-gold opacity-[0.04] select-none pointer-events-none leading-none">§</span>
        <div className="relative z-10 text-center max-w-lg animate-fade-in-up">
          <h1 className="font-barlow font-extrabold text-3xl md:text-5xl mb-4">Vamos <span className="text-lima">conversar</span>?</h1>
          <p className="text-muted-foreground font-inter text-sm">Preencha o formulário e entraremos em contato.</p>
        </div>
      </section>

      {/* FORM */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-lg animate-fade-in-up-delay-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Nome completo *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-surface border-border h-12 font-inter" />
            <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v })}>
              <SelectTrigger className="bg-surface border-border h-12 font-inter"><SelectValue placeholder="Especialidade *" /></SelectTrigger>
              <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.room_interest} onValueChange={(v) => setForm({ ...form, room_interest: v })}>
              <SelectTrigger className="bg-surface border-border h-12 font-inter"><SelectValue placeholder="Sala de interesse" /></SelectTrigger>
              <SelectContent>{rooms.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="WhatsApp com DDD *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-surface border-border h-12 font-inter" />
            <Input type="email" placeholder="E-mail *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-surface border-border h-12 font-inter" />
            <Textarea placeholder="Mensagem (opcional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-surface border-border min-h-[120px] font-inter" />
            <Button type="submit" disabled={loading} size="lg" className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold text-sm h-12">
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="https://wa.me/5587993123121?text=Ol%C3%A1!%20Vi%20o%20site%20da%20Pedrosa%20Sant%C3%A9%20e%20tenho%20interesse%20em%20saber%20mais%20sobre%20as%20salas."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-lima text-primary-foreground px-6 py-3 font-inter text-sm font-semibold hover:bg-lima/90 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Conversar pelo WhatsApp
            </a>
            <a
              href="https://instagram.com/pedrosasante"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-inter transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @pedrosasante
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contato;
