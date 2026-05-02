import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LeadFormModal from "@/components/LeadFormModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, Heart, Sparkles, Clock, CalendarCheck, Star } from "lucide-react";

const pillars = [
  { icon: Award, title: "Sem contrato fixo", desc: "Alugue por meio período ou dia inteiro. Sem mensalidade, sem compromisso de longo prazo." },
  { icon: CalendarCheck, title: "Reserve com antecedência", desc: "Escolha a data e o turno pelo portal. A sala estará pronta quando você chegar." },
  { icon: Sparkles, title: "Espaço que impressiona", desc: "Seus pacientes não vão acreditar que estão em Caruaru. Você cobra o que vale." },
];

const rooms = [
  { title: "Sala 01", tag: "Locação por turno", desc: "Consultório versátil para consultas médicas, psicologia, nutrição e terapias.", image: "/renders/consultorio.jpg" },
  { title: "Sala 02", tag: "Locação por turno", desc: "Ambiente intimista e acolhedor para especialidades que exigem privacidade e conforto.", image: "/renders/consultorio.jpg" },
  { title: "Sala 03", tag: "Locação por turno", desc: "Espaço elegante e funcional para diversas especialidades de saúde.", image: "/renders/consultorio.jpg" },
  { title: "Sala Odontológica", tag: "Meio dia ou dia todo", desc: "Equipada com cadeira, compressor, refletor e sugador. Para o dentista que quer atender no padrão que seus pacientes merecem.", image: "/renders/sala-dentista.jpg" },
];

const scenarios = [
  {
    icon: Star,
    title: "Você está começando",
    desc: "Não precisa de consultório próprio para atender como referência. Alugue por turno e comece no nível que a maioria demora anos para alcançar.",
  },
  {
    icon: Clock,
    title: "Você já tem sua clínica",
    desc: "Tem um paciente especial — um artista, um executivo, alguém que merece mais. Reserve a sala odontológica por um dia e entregue uma experiência que nenhuma outra clínica de Caruaru oferece.",
  },
  {
    icon: Heart,
    title: "Você quer crescer sem risco",
    desc: "Teste novos dias, novos bairros, nova clientela — sem assinar contrato. Pague só pelo que usar e decida se vale expandir.",
  },
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
          src="/renders/recepcao-nova.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-primary/72" aria-hidden="true" />
        <span className="absolute text-[30rem] md:text-[50rem] font-barlow font-extrabold text-gold opacity-[0.04] select-none pointer-events-none leading-none z-10" aria-hidden="true">§</span>
        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="font-barlow font-extrabold text-3xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Alugue uma sala no padrão<br />que seus pacientes <span className="text-lima">merecem</span>.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-4 font-inter max-w-xl mx-auto animate-fade-in-up-delay-1">
            Meio dia, dia todo ou turno avulso. Sem mensalidade, sem contrato.
            O consultório premium de Caruaru disponível para você atender quando quiser.
          </p>
          <p className="text-lima/80 text-sm font-inter tracking-wide mb-10 animate-fade-in-up-delay-1">
            Inauguração em breve — garanta sua data agora
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
            <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4">Como funciona</p>
            <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-6">
              Reserve, chegue e<br />atenda. Simples assim.
            </h2>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm md:text-base mb-4">
              A Pedrosa Santé é um centro de saúde com salas disponíveis para locação por turno.
              Você escolhe a data, o período — manhã, tarde ou dia todo — e a sala estará pronta,
              limpa e equipada quando você chegar.
            </p>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm md:text-base">
              Sem obras, sem mobília, sem contrato de aluguel fixo. Pague pelo dia que usar
              e foque no que realmente importa: cuidar dos seus pacientes.
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

      {/* PARA QUEM É — CENÁRIOS */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4">Para quem é</p>
            <h2 className="font-barlow font-extrabold text-2xl md:text-4xl">
              Você reconhece a sua história<br />em alguma dessas?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((s) => (
              <div key={s.title} className="border border-border bg-background p-8 hover:border-lima/30 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center border border-border rounded mb-6">
                  <s.icon className="h-5 w-5 text-lima" />
                </div>
                <h3 className="font-barlow font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm font-inter leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDADORA */}
      <section className="py-24 px-4 bg-surface">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="/renders/2486D414-02FC-4762-A0B0-FDD561A8A393.png"
              alt="Dra. Emanuelly Pedrosa"
              className="w-full aspect-[3/4] object-cover object-top border border-border"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t border-border">
              <p className="font-barlow font-bold text-sm">Dra. Emanuelly Pedrosa</p>
              <p className="text-xs text-muted-foreground font-inter">Cirurgiã-Dentista · Fundadora</p>
            </div>
          </div>
          <div className="space-y-6">
            <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase">Nossa Fundadora</p>
            <h2 className="font-barlow font-extrabold text-3xl md:text-4xl leading-tight">
              Uma trajetória construída com propósito
            </h2>
            <blockquote className="border-l-2 border-lima pl-5 py-1">
              <p className="font-barlow font-light text-xl md:text-2xl text-foreground/90 italic leading-snug">
                "Cada paciente atendido foi um passo para a construção de quem sou hoje."
              </p>
            </blockquote>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm">
              Formada em 2018 pela ASCES-UNITA, com pós em Endodontia, residência em Harmonização
              Orofacial e pós em Dentística Estética, a Dra. Emanuelly trilhou uma trajetória marcada
              por desafios, perdas e superação — incluindo a perda dos seus pais durante a pandemia.
            </p>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm">
              Em 2021, fundou a Clínica Dra. Emanuelly Pedrosa, referência em odontologia estética
              humanizada na região. Hoje, movida por um propósito maior, cria a Pedrosa Santé —
              um centro integrado que vai além da estética e transforma vidas.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                "Cirurgiã-Dentista ASCES-UNITA 2018",
                "Pós-Graduada em Endodontia",
                "Residência em Harmonização Orofacial",
                "Pós em Dentística Estética",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-lima shrink-0" />
                  <span className="text-xs text-muted-foreground font-inter">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO SURGIMOS */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-12">
            <img src="/renders/Logo 1_White.png" alt="Pedrosa Santé" className="h-8 opacity-40" />
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-5">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase">Como Surgimos</p>
              <h2 className="font-barlow font-extrabold text-3xl md:text-4xl leading-tight">
                Mais do que uma clínica.<br />Um novo conceito.
              </h2>
              <p className="text-muted-foreground font-inter leading-relaxed text-sm">
                A Pedrosa Santé nasce com um propósito claro: elevar o padrão de cuidado em saúde,
                estética e performance em Caruaru e região.
              </p>
              <p className="text-muted-foreground font-inter leading-relaxed text-sm">
                Mais do que uma clínica, somos um centro integrado de saúde, idealizado para oferecer
                uma experiência completa, reunindo diferentes especialidades em um ambiente moderno,
                sofisticado e altamente funcional.
              </p>
              <p className="text-muted-foreground font-inter leading-relaxed text-sm">
                Um conceito inovador que Caruaru e região ainda não vivenciaram.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-6">Nossa Estrutura</p>
              {[
                { title: "Sala Odontológica", desc: "Equipada por turno para cirurgiões-dentistas" },
                { title: "Sala Médica", desc: "Disponível por turno para diferentes especialidades" },
                { title: "Três Salas Fixas", desc: "Para profissionais que desejam personalizar seu espaço" },
                { title: "Centro de Formação", desc: "Cursos, mentorias e imersões para profissionais" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start p-4 border border-border bg-surface hover:border-lima/30 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-lima mt-1.5 shrink-0" />
                  <div>
                    <p className="font-barlow font-bold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-inter mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-border">
            {[
              { label: "Missão", text: "Transformar vidas através do cuidado, da estética e do conhecimento." },
              { label: "Visão", text: "Ser referência em saúde integrada e formação profissional em Caruaru e região." },
              { label: "Valores", text: "Fé, propósito, ética, excelência, cuidado com o próximo e compromisso com resultados reais." },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <p className="text-xs text-lima font-inter tracking-[0.2em] uppercase">{item.label}</p>
                <p className="text-sm text-muted-foreground font-inter leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AS SALAS */}
      <section className="py-24 px-4 bg-surface">
        <div className="container mx-auto">
          <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4 text-center animate-fade-in-up">Salas disponíveis para locação</p>
          <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-4 text-center animate-fade-in-up">
            Quatro ambientes. Um único <span className="text-lima">padrão</span>.
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-sm font-inter animate-fade-in-up-delay-1">
            Todas as salas disponíveis para aluguel por turno. Escolha a data e reserve.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div key={room.title} className="group border border-border bg-background overflow-hidden hover:border-lima/30 transition-colors">
                <div className="relative">
                  <img src={room.image} alt={room.title} className="w-full aspect-[4/3] object-cover" />
                  <span className="absolute top-3 left-3 bg-lima text-primary-foreground text-[10px] font-inter font-semibold px-2 py-1 tracking-wide">
                    {room.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-barlow font-bold text-lg mb-2">{room.title}</h3>
                  <p className="text-muted-foreground text-xs font-inter mb-4 leading-relaxed">{room.desc}</p>
                  <Button variant="outline" size="sm" onClick={() => openModal(room.title)} className="border-lima/40 text-lima hover:bg-lima hover:text-primary-foreground text-xs font-inter">
                    Quero reservar esta sala
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 bg-lima">
        <div className="container mx-auto max-w-2xl text-center">
          <p className="text-primary-foreground/70 text-xs font-inter tracking-[0.25em] uppercase mb-4">Inauguração em breve · Caruaru-PE</p>
          <h2 className="font-barlow font-extrabold text-2xl md:text-4xl text-primary-foreground mb-4">
            Garanta sua data antes<br />de todo mundo.
          </h2>
          <p className="text-primary-foreground/80 text-sm font-inter mb-8 max-w-md mx-auto">
            Deixe seu contato e a nossa equipe entra em touch para apresentar as salas, os valores e as datas disponíveis.
          </p>
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
