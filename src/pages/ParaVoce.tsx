import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Heart, Sparkles, Shield, ArrowRight } from "lucide-react";

const pillars = [
  { icon: Award, title: "Excelência", desc: "Alto nível de qualificação dos profissionais envolvidos. Espaço que transmite autoridade e credibilidade a cada paciente que entra." },
  { icon: Heart, title: "Humanização", desc: "Atendimento acolhedor. Ambiente que transmite cuidado e conforto em cada detalhe, porque saúde também é sobre acolhimento." },
  { icon: Sparkles, title: "Sofisticação e Bem-Estar", desc: "Design refinado, materiais premium e um espaço que impressiona seus pacientes. Uma experiência que vai além da consulta." },
  { icon: Shield, title: "Ética e Compromisso", desc: "Transparência e respeito em todas as interações. Valores que guiam cada decisão e cada relação construída no espaço." },
];

const steps = [
  { num: "01", title: "Interesse", desc: "Preencha o formulário ou entre em contato pelo WhatsApp." },
  { num: "02", title: "Contato", desc: "Nossa equipe entra em contato para entender suas necessidades." },
  { num: "03", title: "Visita", desc: "Agende uma visita para conhecer o espaço pessoalmente." },
  { num: "04", title: "Contrato", desc: "Formalize a parceria e comece a atender seus pacientes." },
];

const ParaVoce = () => (
  <>
    {/* HERO */}
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 py-24">
      <span className="absolute text-[20rem] md:text-[35rem] font-barlow font-extrabold text-gold opacity-[0.04] select-none pointer-events-none leading-none">§</span>
      <div className="relative z-10 text-center max-w-2xl animate-fade-in-up">
        <h1 className="font-barlow font-extrabold text-3xl md:text-5xl mb-4">Você merece um espaço à altura do seu <span className="text-lima">trabalho</span></h1>
        <p className="text-muted-foreground font-inter text-sm md:text-base">Descubra por que profissionais de saúde estão escolhendo a Pedrosa Santé.</p>
      </div>
    </section>

    {/* PILARES */}
    <section className="py-24 px-4 bg-surface">
      <div className="container mx-auto max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10">
          {pillars.map((p) => (
            <div key={p.title} className="border border-border bg-background p-8">
              <p.icon className="h-8 w-8 text-lima mb-4" />
              <h3 className="font-barlow font-bold text-lg mb-3">{p.title}</h3>
              <p className="text-muted-foreground text-sm font-inter leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* COMO FUNCIONA */}
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="font-barlow font-extrabold text-2xl md:text-4xl mb-16">Como <span className="text-lima">funciona</span></h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              <span className="font-barlow font-extrabold text-4xl text-lima/20 block mb-2">{s.num}</span>
              <h3 className="font-barlow font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-xs font-inter leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute -right-4 top-6 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-4 bg-lima">
      <div className="container mx-auto text-center">
        <h2 className="font-barlow font-extrabold text-2xl md:text-4xl text-primary-foreground mb-6">
          Pronto para elevar o seu padrão?
        </h2>
        <Link to="/contato">
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-inter font-semibold text-sm">
            Entrar em contato
          </Button>
        </Link>
      </div>
    </section>
  </>
);

export default ParaVoce;
