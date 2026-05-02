import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LeadFormModal from "@/components/LeadFormModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, Heart, Sparkles } from "lucide-react";

const pillars = [
  { icon: Award, title: "Excelência", desc: "Alto nível de qualificação e um espaço que transmite autoridade e confiança." },
  { icon: Heart, title: "Humanização", desc: "Atendimento acolhedor em um ambiente que transmite cuidado e conforto." },
  { icon: Sparkles, title: "Sofisticação & Bem-Estar", desc: "Design refinado, materiais premium e um espaço que impressiona seus pacientes." },
];

const rooms = [
  { title: "Sala 01", desc: "Sala versátil e ampla, ideal para consultas médicas e atendimentos clínicos.", image: "/renders/consultorio.jpg" },
  { title: "Sala 02", desc: "Ambiente acolhedor, perfeito para psicologia, nutrição e terapias.", image: "/renders/consultorio.jpg" },
  { title: "Sala 03", desc: "Espaço funcional e elegante para diversas especialidades de saúde.", image: "/renders/consultorio.jpg" },
  { title: "Sala Odontológica", desc: "Completa para atendimento odontológico de alto padrão.", image: "/renders/sala-dentista.jpg" },
];

const specialties = [
  "Odontologia", "Medicina", "Psicologia", "Nutrição", "Fisioterapia", "Outras"
];

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRoom, setModalRoom] = useState("");
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaForm, setCtaForm] = useState({ name: "", specialty: "", phone: "" });

  const openModal = (room?: string) => {
    setModalRoom(room || "");
    setModalOpen(true);
  };

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctaForm.name || !ctaForm.specialty || !ctaForm.phone) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setCtaLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: ctaForm.name,
      specialty: ctaForm.specialty,
      phone: ctaForm.phone,
      email: "via-cta-homepage@lead.com",
    });
    setCtaLoading(false);
    if (error) {
      toast.error("Erro ao enviar.");
    } else {
      toast.success("Interesse registrado com sucesso!");
      setCtaForm({ name: "", specialty: "", phone: "" });
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4">
        <img
          src="/renders/recepcao-01.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-primary/72" aria-hidden="true" />
        <span className="absolute text-[30rem] md:text-[50rem] font-barlow font-extrabold text-gold opacity-[0.04] select-none pointer-events-none leading-none z-10" aria-hidden="true">§</span>
        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="font-barlow font-extrabold text-3xl md:text-5xl lg:text-6xl leading-tight mb-6">
            O padrão não é um diferencial,<br />é o nosso <span className="text-lima">padrão</span>.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-10 font-inter max-w-xl mx-auto animate-fade-in-up-delay-1">
            Espaço premium para profissionais de saúde autônomos. Fase final de construção.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <Link to="/espacos">
              <Button variant="outline" size="lg" className="border-foreground/20 hover:bg-foreground/5 font-inter text-sm tracking-wide">
                Conhecer os espaços
              </Button>
            </Link>
            <Button size="lg" onClick={() => openModal()} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-sm tracking-wide font-semibold">
              Quero ser contatado
            </Button>
          </div>
        </div>
      </section>

      {/* CONCEITO */}
      <section className="py-24 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="animate-fade-in-up">
            <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-6">Pedrosa Santé</h2>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm md:text-base">
              A Pedrosa Santé nasceu do compromisso de oferecer um espaço que transcende o convencional. Aqui, cada detalhe foi pensado para que o profissional de saúde autônomo tenha à disposição um ambiente que reflete excelência, humanização e sofisticação. Não somos mercadoria — somos marca.
            </p>
          </div>
          <div className="grid gap-8">
            {pillars.map((p, i) => (
              <div key={p.title} className={`flex gap-4 items-start animate-fade-in-up-delay-${i + 1}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border rounded">
                  <p.icon className="h-5 w-5 text-lima" />
                </div>
                <div>
                  <h3 className="font-barlow font-bold text-sm mb-1">{p.title}</h3>
                  <p className="text-muted-foreground text-xs font-inter leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AS SALAS */}
      <section className="py-24 px-4 bg-surface">
        <div className="container mx-auto">
          <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-4 text-center animate-fade-in-up">
            Quatro ambientes. Um único <span className="text-lima">padrão</span>.
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-sm font-inter animate-fade-in-up-delay-1">
            Conheça os espaços que estamos preparando para você.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div key={room.title} className="group border border-border bg-background overflow-hidden hover:border-lima/30 transition-colors">
                <img src={room.image} alt={room.title} className="w-full aspect-[4/3] object-cover" />
                <div className="p-6">
                  <h3 className="font-barlow font-bold text-lg mb-2">{room.title}</h3>
                  <p className="text-muted-foreground text-xs font-inter mb-4 leading-relaxed">{room.desc}</p>
                  <Button variant="outline" size="sm" onClick={() => openModal(room.title)} className="border-lima/40 text-lima hover:bg-lima hover:text-primary-foreground text-xs font-inter">
                    Saiba mais
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto text-center">
          <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-12 animate-fade-in-up">
            Feito para quem não aceita menos que <span className="text-lima">excelência</span>.
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {specialties.map((s) => (
              <div key={s} className="px-6 py-4 border border-border bg-background font-inter text-sm text-muted-foreground hover:text-foreground hover:border-lima/30 transition-colors">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-lima">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-barlow font-extrabold text-2xl md:text-4xl text-primary-foreground mb-8">
            Reserve seu espaço antes da inauguração.
          </h2>
          <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Nome"
              value={ctaForm.name}
              onChange={(e) => setCtaForm({ ...ctaForm, name: e.target.value })}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 font-inter"
            />
            <Input
              placeholder="Especialidade"
              value={ctaForm.specialty}
              onChange={(e) => setCtaForm({ ...ctaForm, specialty: e.target.value })}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 font-inter"
            />
            <Input
              placeholder="WhatsApp"
              value={ctaForm.phone}
              onChange={(e) => setCtaForm({ ...ctaForm, phone: e.target.value })}
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 font-inter"
            />
            <Button type="submit" disabled={ctaLoading} className="bg-background text-foreground hover:bg-background/90 font-inter font-semibold whitespace-nowrap text-sm">
              {ctaLoading ? "..." : "Quero ser contatado"}
            </Button>
          </form>
        </div>
      </section>

      <LeadFormModal open={modalOpen} onOpenChange={setModalOpen} defaultRoom={modalRoom} />
    </>
  );
};

export default Index;
