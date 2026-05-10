import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LeadFormModal from "@/components/LeadFormModal";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Building2, Star, Clock, MapPin, Stethoscope, Sparkles, Shield, Users, ChevronRight } from "lucide-react";

const HERO_DEFAULTS = [
  "/renders/recepcao-nova.jpg",
  "/renders/recepcao-02.jpg",
  "/renders/recepcao-03.jpg",
  "/renders/recepcao-04.jpg",
];

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRoom, setModalRoom] = useState("");
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaForm, setCtaForm] = useState({ name: "", specialty: "", phone: "" });
  const [whatsapp, setWhatsapp] = useState("");
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroImages, setHeroImages] = useState(HERO_DEFAULTS);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["whatsapp_number", "photo_hero_1", "photo_hero_2", "photo_hero_3", "photo_hero_4"])
      .then(({ data }) => {
        if (!data) return;
        const wp = data.find((s) => s.key === "whatsapp_number")?.value;
        if (wp) setWhatsapp(wp);
        const overrides = HERO_DEFAULTS.map((d, i) => data.find((s) => s.key === `photo_hero_${i + 1}`)?.value || d);
        setHeroImages(overrides);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_DEFAULTS.length), 5000);
    return () => clearInterval(timer);
  }, []);

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
      {/* HERO — Carousel */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1.5s] ease-in-out ${i === heroIdx ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" aria-hidden="true" />
        <span className="absolute text-[30rem] md:text-[50rem] font-barlow font-extrabold text-gold opacity-[0.03] select-none pointer-events-none leading-none z-10" aria-hidden="true">§</span>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-lima text-xs font-inter tracking-[0.35em] uppercase mb-6 animate-fade-in-up">
            Pedrosa Santé · Caruaru-PE
          </p>
          <h1 className="font-barlow font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 animate-fade-in-up">
            Excelência não é<br />um diferencial,<br />é o nosso <span className="text-lima">padrão</span>.
          </h1>
          <p className="text-foreground/70 text-base md:text-lg mb-10 font-inter max-w-xl mx-auto animate-fade-in-up-delay-1">
            Espaço premium para profissionais de saúde autônomos. Fase final de construção.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-2">
            <Link to="/espacos">
              <Button variant="outline" size="lg" className="border-foreground/20 hover:bg-foreground/5 font-inter text-sm tracking-wide">
                Conhecer os espaços
              </Button>
            </Link>
            <Button size="lg" onClick={() => openModal()} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-sm tracking-wide font-semibold">
              Quero saber mais
            </Button>
          </div>

          {/* Hero image indicators */}
          <div className="flex gap-2 justify-center mt-10 animate-fade-in-up-delay-3">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIdx(i)}
                className={`h-1 rounded-full transition-all duration-500 ${i === heroIdx ? "w-8 bg-lima" : "w-4 bg-foreground/20"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA — Fotos do ambiente */}
      <section className="py-16 px-4 bg-background overflow-hidden">
        <ScrollReveal>
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                "/renders/recepcao-02.jpg",
                "/renders/recepcao-03.jpg",
                "/renders/recepcao-05.jpg",
                "/renders/recepcao-04.jpg",
              ].map((src, i) => (
                <div key={src} className="overflow-hidden group">
                  <img
                    src={src}
                    alt={`Ambiente Pedrosa Santé ${i + 1}`}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* COMO FUNCIONA — 2 MODELOS */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4">Como funciona</p>
              <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-4">
                Escolha como você quer atender
              </h2>
              <p className="text-muted-foreground font-inter text-sm max-w-xl mx-auto">
                Dois modelos. Um único padrão de excelência.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal variant="left">
              <div className="border border-lima/30 bg-lima/5 p-8 relative overflow-hidden hover-lift h-full">
                <span className="absolute top-4 right-4 text-[10px] font-inter font-semibold bg-lima text-primary-foreground px-2 py-1 tracking-wide">
                  Por turno
                </span>
                <div className="flex h-12 w-12 items-center justify-center border border-lima/30 rounded mb-6">
                  <Calendar className="h-5 w-5 text-lima" />
                </div>
                <h3 className="font-barlow font-bold text-xl mb-3">Sala pronta. Reserve e atenda.</h3>
                <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-6">
                  Escolha a data e o turno — manhã (08h–12h), tarde (14h–18h) ou noite (18h–22h).
                  A sala estará equipada, limpa e pronta quando você chegar.
                  Sem contrato, sem mensalidade. Pague apenas pelo que usar.
                </p>
                <ul className="space-y-2">
                  {[
                    "Sala odontológica equipada (cadeira, compressor, refletor, sugador)",
                    "Sala clínica para medicina, psicologia, nutrição e mais",
                    "Sala de esterilização inclusa para dentistas",
                    "Recepção profissional com suporte",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground font-inter">
                      <ChevronRight className="h-3 w-3 text-lima mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs font-semibold"
                  size="sm"
                  onClick={() => openModal()}
                >
                  Quero reservar por turno
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right">
              <div className="border border-border bg-surface p-8 relative overflow-hidden hover-lift h-full">
                <span className="absolute top-4 right-4 text-[10px] font-inter font-semibold border border-border text-muted-foreground px-2 py-1 tracking-wide">
                  Sala fixa
                </span>
                <div className="flex h-12 w-12 items-center justify-center border border-border rounded mb-6">
                  <Building2 className="h-5 w-5 text-lima" />
                </div>
                <h3 className="font-barlow font-bold text-xl mb-3">Seu consultório. Do seu jeito.</h3>
                <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-6">
                  Alugue uma das 3 salas fixas e monte como quiser. Você tem exclusividade
                  total sobre o espaço — mobília, equipamentos, identidade visual.
                  Tudo dentro de um ecossistema profissional de alto padrão.
                </p>
                <ul className="space-y-2">
                  {[
                    "Espaço exclusivo, personalização total",
                    "Instalação de ar-condicionado inverter obrigatória (energia inclusa no aluguel)",
                    "Recepção compartilhada (até 3 secretárias)",
                    "Copa, banheiros e áreas comuns de alto padrão",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground font-inter">
                      <ChevronRight className="h-3 w-3 text-lima mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="mt-8 border-lima/40 text-lima hover:bg-lima hover:text-primary-foreground font-inter text-xs"
                  size="sm"
                  onClick={() => openModal()}
                >
                  Quero uma sala fixa
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SALAS PRONTAS — POR TURNO */}
      <section className="py-24 px-4 bg-surface">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <span className="inline-block text-[10px] font-inter font-semibold bg-lima text-primary-foreground px-3 py-1 tracking-widest uppercase mb-4">
                Por turno
              </span>
              <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-3">
                Salas equipadas e prontas para uso
              </h2>
              <p className="text-muted-foreground font-inter text-sm max-w-lg">
                Reserve o turno, chegue e atenda. Sem instalar nada, sem se preocupar com estrutura.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="group border border-border bg-background overflow-hidden hover:border-lima/30 transition-all hover-lift">
                <div className="relative overflow-hidden">
                  <img src="/renders/sala-dentista.jpg" alt="Sala Odontológica" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 bg-lima text-primary-foreground text-[10px] font-inter font-semibold px-2 py-1 tracking-wide">
                    Por turno · 08h–12h / 14h–18h / 18h–22h
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-barlow font-bold text-lg mb-2">Sala Odontológica</h3>
                  <p className="text-muted-foreground text-xs font-inter mb-4 leading-relaxed">
                    Equipada com cadeira, compressor, refletor e sugador. Estrutura profissional
                    para o dentista que quer atender no mais alto padrão.
                  </p>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-lima/5 border border-lima/20">
                    <Shield className="h-3 w-3 text-lima shrink-0" />
                    <span className="text-xs text-lima font-inter font-medium">Sala de esterilização inclusa sem custo adicional</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openModal("Sala Odontológica")} className="border-lima/40 text-lima hover:bg-lima hover:text-primary-foreground text-xs font-inter">
                    Quero reservar esta sala
                  </Button>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="group border border-border bg-background overflow-hidden hover:border-lima/30 transition-all hover-lift">
                <div className="relative overflow-hidden">
                  <img src="/renders/consultorio.jpg" alt="Sala Clínica" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 bg-lima text-primary-foreground text-[10px] font-inter font-semibold px-2 py-1 tracking-wide">
                    Por turno · 08h–12h / 14h–18h / 18h–22h
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-barlow font-bold text-lg mb-2">Sala Clínica</h3>
                  <p className="text-muted-foreground text-xs font-inter mb-4 leading-relaxed">
                    Consultório versátil para medicina, psicologia, nutrição, fisioterapia e
                    outras especialidades.
                  </p>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-surface border border-border">
                    <Stethoscope className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground font-inter">Medicina · Psicologia · Nutrição · Fisioterapia · e mais</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openModal("Sala Clínica")} className="border-lima/40 text-lima hover:bg-lima hover:text-primary-foreground text-xs font-inter">
                    Quero reservar esta sala
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SALAS FIXAS */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="mb-12">
              <span className="inline-block text-[10px] font-inter font-semibold border border-border text-muted-foreground px-3 py-1 tracking-widest uppercase mb-4">
                Sala fixa
              </span>
              <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-3">
                Seu próprio consultório,<br />dentro do ecossistema
              </h2>
              <p className="text-muted-foreground font-inter text-sm max-w-lg">
                Monte como quiser. Coloque sua identidade visual, seus equipamentos.
                O espaço é seu — a estrutura é nossa.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Sala 01", desc: "Espaço amplo, ideal para especialidades que recebem um volume maior de pacientes por dia." },
              { title: "Sala 02", desc: "Ambiente intimista, perfeito para especialidades que exigem privacidade e acolhimento." },
              { title: "Sala 03", desc: "Versátil e bem posicionada, para quem quer flexibilidade na organização do espaço." },
            ].map((room, i) => (
              <ScrollReveal key={room.title} delay={i * 120}>
                <div className="group border border-border bg-surface overflow-hidden hover:border-lima/30 transition-all hover-lift">
                  <div className="relative overflow-hidden">
                    <img src="/renders/consultorio.jpg" alt={room.title} className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-3 left-3 border border-border bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-inter font-semibold px-2 py-1 tracking-wide">
                      Sala fixa
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-barlow font-bold text-lg mb-2">{room.title}</h3>
                    <p className="text-muted-foreground text-xs font-inter mb-4 leading-relaxed">{room.desc}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-3 w-3 text-lima shrink-0" />
                      <span className="text-xs text-muted-foreground font-inter">Instalação de ar-condicionado inverter obrigatória</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openModal(room.title)} className="border-lima/40 text-lima hover:bg-lima hover:text-primary-foreground text-xs font-inter">
                      Tenho interesse
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ESTRUTURA COMPLETA */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4">Infraestrutura</p>
              <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-4">
                Tudo que você precisa.<br />Nada que você precise instalar.
              </h2>
              <p className="text-muted-foreground font-inter text-sm max-w-xl mx-auto">
                Estrutura pensada para que você chegue, atenda e saia — sem se preocupar com nada além do seu paciente.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Building2, title: "2 salas prontas por turno", desc: "Odontológica + Clínica geral, equipadas e disponíveis" },
                { icon: Star, title: "3 salas para locação fixa", desc: "Personalize com sua identidade, seu jeito, sua marca" },
                { icon: Users, title: "Recepção para até 3 secretárias", desc: "Tanto para profissionais fixos quanto para quem atende por turno" },
                { icon: Shield, title: "Sala de esterilização", desc: "Inclusa, sem custo adicional" },
                { icon: Stethoscope, title: "Copa compartilhada", desc: "Área de descanso e preparo para toda a equipe" },
                { icon: Sparkles, title: "Ar-condicionado inverter", desc: "Obrigatório nas salas fixas. Energia inclusa no aluguel." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start p-5 border border-border bg-background hover:border-lima/30 transition-all hover-lift">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border rounded">
                    <item.icon className="h-5 w-5 text-lima" />
                  </div>
                  <div>
                    <p className="font-barlow font-bold text-sm mb-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-inter leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="py-24 px-4 bg-surface">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4">Para quem é</p>
              <h2 className="font-barlow font-extrabold text-2xl md:text-4xl">
                Você se reconhece em<br />alguma dessas situações?
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Star,
                title: "Você está começando",
                desc: "Não precisa de consultório próprio para atender como referência. Alugue por turno e comece no padrão que a maioria leva anos para alcançar.",
              },
              {
                icon: Clock,
                title: "Você já tem sua clínica",
                desc: "Tem um paciente especial — alguém exigente. Reserve a sala por um dia e entregue uma experiência que nenhuma outra clínica de Caruaru oferece.",
              },
              {
                icon: MapPin,
                title: "Você é de outra cidade",
                desc: "Quer atender em Caruaru sem custo fixo? Reserve uma sala, atenda seus pacientes e vá embora. Sem aluguel mensal, sem estrutura para montar.",
              },
            ].map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 120}>
                <div className="border border-border bg-background p-8 hover:border-lima/30 transition-all hover-lift h-full">
                  <div className="flex h-10 w-10 items-center justify-center border border-border rounded mb-6">
                    <s.icon className="h-5 w-5 text-lima" />
                  </div>
                  <h3 className="font-barlow font-bold text-lg mb-3">{s.title}</h3>
                  <p className="text-muted-foreground text-sm font-inter leading-relaxed">{s.desc}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-lima hover:bg-lima/10 font-inter text-xs px-0 gap-1"
                    onClick={() => openModal()}
                  >
                    Quero saber mais <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-lima">
        <ScrollReveal variant="scale">
          <div className="container mx-auto max-w-2xl text-center">
            <p className="text-primary-foreground/70 text-xs font-inter tracking-[0.25em] uppercase mb-4">
              Inauguração em breve · Caruaru-PE
            </p>
            <h2 className="font-barlow font-extrabold text-2xl md:text-4xl text-primary-foreground mb-4">
              Garanta seu espaço antes<br />da inauguração.
            </h2>
            <p className="text-primary-foreground/80 text-sm font-inter mb-10 max-w-md mx-auto">
              Deixe seu contato. Nossa equipe entra em contato para apresentar as salas, os valores e as datas disponíveis.
            </p>
            <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                placeholder="Seu nome"
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
              <Button
                type="submit"
                disabled={ctaLoading}
                className="bg-background text-foreground hover:bg-background/90 font-inter font-semibold whitespace-nowrap text-sm"
              >
                {ctaLoading ? "..." : "Quero ser contatado"}
              </Button>
            </form>
            <p className="text-primary-foreground/60 text-xs font-inter">
              Prefere falar agora?{" "}
              <a
                href={whatsapp ? `https://wa.me/${whatsapp}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-primary-foreground transition-colors"
              >
                Fale no WhatsApp
              </a>
            </p>
          </div>
        </ScrollReveal>
      </section>

      <LeadFormModal open={modalOpen} onOpenChange={setModalOpen} defaultRoom={modalRoom} />
    </>
  );
};

export default Index;
