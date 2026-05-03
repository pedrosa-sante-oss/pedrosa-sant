import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const QuemSomos = () => {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4">
        <img
          src="/renders/recepcao-nova.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-primary/70" aria-hidden="true" />
        <span className="absolute text-[20rem] md:text-[35rem] font-barlow font-extrabold text-gold opacity-[0.04] select-none pointer-events-none leading-none z-10" aria-hidden="true">§</span>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-lima text-xs font-inter tracking-[0.3em] uppercase mb-6">Pedrosa Santé</p>
          <h1 className="font-barlow font-extrabold text-3xl md:text-5xl leading-tight mb-6">
            A história por trás do espaço
          </h1>
          <p className="text-foreground/80 text-base font-inter max-w-lg mx-auto">
            Um sonho construído com propósito, fé e a certeza de que grandes ideias nascem nos momentos mais difíceis.
          </p>
        </div>
      </section>

      {/* NOSSA FUNDADORA */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              src="/renders/2486D414-02FC-4762-A0B0-FDD561A8A393.png"
              alt="Dra. Emanuelly Pedrosa"
              className="w-full aspect-[3/4] object-cover object-top border border-border"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-background/85 backdrop-blur-sm p-5 border-t border-border">
              <p className="font-barlow font-bold text-sm">Dra. Emanuelly Pedrosa</p>
              <p className="text-xs text-muted-foreground font-inter mt-0.5">Cirurgiã-Dentista · Fundadora da Pedrosa Santé</p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase">Nossa Fundadora</p>
            <h2 className="font-barlow font-extrabold text-3xl md:text-4xl leading-tight">
              Dra. Emanuelly Pedrosa
            </h2>

            <blockquote className="border-l-2 border-lima pl-5 py-2">
              <p className="font-barlow font-light text-xl md:text-2xl text-foreground/90 italic leading-snug">
                "Cada paciente atendido foi um passo para a construção de quem sou hoje."
              </p>
            </blockquote>

            <p className="text-muted-foreground font-inter leading-relaxed text-sm">
              Sou Dra. Emanuelly Pedrosa, cirurgiã-dentista formada pela Faculdade ASCES-UNITA em 2018,
              com 32 anos e apaixonada por transformar vidas através do sorriso.
            </p>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm">
              Desde o início da minha trajetória, escolhi a odontologia estética como propósito —
              não apenas pela técnica, mas pelo impacto direto na autoestima e na identidade das pessoas.
            </p>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm">
              Sou pós-graduada em Endodontia, possuo residência em Harmonização Orofacial e pós-graduação
              em Dentística com foco em estética dentária. Ao longo dos anos, busquei conhecer clínicas de
              alto padrão em diversas regiões do Brasil, o que ampliou minha visão sobre experiência,
              atendimento e excelência.
            </p>
            <p className="text-muted-foreground font-inter leading-relaxed text-sm">
              Hoje, além de cuidar de pacientes, compartilho conhecimento através de mentorias,
              formando profissionais que desejam atuar com segurança, excelência e propósito na estética.
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

      {/* A HISTÓRIA — TIMELINE */}
      <section className="py-24 px-4 bg-surface">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-4">A jornada</p>
            <h2 className="font-barlow font-extrabold text-2xl md:text-4xl">
              Uma história construída<br />na superação
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {[
              {
                year: "2018",
                title: "A formação",
                text: "Formada pela ASCES-UNITA. Desde o início, a odontologia estética como propósito — pelo impacto direto na autoestima e na identidade das pessoas. Não apenas pela técnica.",
                side: "right",
              },
              {
                year: "2019–2020",
                title: "Os primeiros desafios",
                text: "Atuou em clínicas com pouca estrutura, enfrentando limitações e baixa valorização. Situações que exigiram muito mais do que conhecimento técnico — exigiram força emocional, resiliência e fé.",
                side: "left",
              },
              {
                year: "2020–2021",
                title: "A pandemia e as perdas",
                text: "Um dos períodos mais difíceis. A partida dos seus pais. Dor, silêncio e reconstrução. Mas também foi nesse momento que entendeu: o propósito é maior do que qualquer circunstância.",
                side: "right",
              },
              {
                year: "2021",
                title: "A Clínica Dra. Emanuelly",
                text: "Fundou a Clínica Dra. Emanuelly Pedrosa — referência em odontologia estética humanizada na região. O começo de uma nova história.",
                side: "left",
              },
              {
                year: "2026",
                title: "A Pedrosa Santé",
                text: "A materialização de tudo. Um centro integrado de saúde que vai além da odontologia — unindo especialidades, promovendo cuidado completo e formando profissionais de excelência.",
                side: "right",
              },
            ].map((item) => (
              <div key={item.year} className={`relative flex md:items-center gap-8 mb-12 ${item.side === "left" ? "md:flex-row-reverse" : "md:flex-row"} flex-row pl-12 md:pl-0`}>
                <div className="flex-1 md:text-right">
                  {item.side === "right" && (
                    <div className="border border-border bg-background p-6 hover:border-lima/30 transition-colors">
                      <p className="text-xs text-lima font-inter tracking-widest uppercase mb-2">{item.year}</p>
                      <h3 className="font-barlow font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm font-inter leading-relaxed">{item.text}</p>
                    </div>
                  )}
                </div>

                <div className="absolute left-0 md:relative md:left-auto flex-shrink-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-lima flex items-center justify-center z-10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                </div>

                <div className="flex-1">
                  {item.side === "left" && (
                    <div className="border border-border bg-background p-6 hover:border-lima/30 transition-colors">
                      <p className="text-xs text-lima font-inter tracking-widest uppercase mb-2">{item.year}</p>
                      <h3 className="font-barlow font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm font-inter leading-relaxed">{item.text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO SURGIMOS */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-5">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase">Como surgimos</p>
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
                O projeto foi pensado nos mínimos detalhes para atender não apenas pacientes, mas
                também profissionais que buscam atuar em um espaço de excelência.
              </p>
              <p className="text-muted-foreground font-inter leading-relaxed text-sm">
                Um conceito inovador que Caruaru e região ainda não vivenciaram.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-lima font-inter tracking-[0.25em] uppercase mb-6">Nossa estrutura</p>
              {[
                { title: "Sala Odontológica", desc: "Equipada por turno para cirurgiões-dentistas, com sala de esterilização inclusa" },
                { title: "Sala Clínica", desc: "Disponível por turno para medicina, psicologia, nutrição e outras especialidades" },
                { title: "3 Salas Fixas", desc: "Para profissionais que desejam ter seu próprio espaço e personalizá-lo" },
                { title: "Centro de Formação", desc: "Cursos, mentorias e imersões para profissionais da saúde" },
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
        </div>
      </section>

      {/* MISSÃO, VISÃO E VALORES */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-12">
            <img src="/renders/Logo 1_White.png" alt="Pedrosa Santé" className="h-8 opacity-40" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { label: "Missão", text: "Transformar vidas através do cuidado, da estética e do conhecimento." },
              { label: "Visão", text: "Ser referência em saúde integrada e formação profissional em Caruaru e região." },
              { label: "Valores", text: "Fé, propósito, ética, excelência, cuidado com o próximo e compromisso com resultados reais." },
            ].map((item) => (
              <div key={item.label} className="text-center space-y-3">
                <p className="text-xs text-lima font-inter tracking-[0.2em] uppercase">{item.label}</p>
                <p className="text-sm text-muted-foreground font-inter leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-16 text-center">
            <p className="font-barlow font-light text-xl md:text-2xl text-foreground/80 italic max-w-2xl mx-auto leading-relaxed mb-10">
              "A Pedrosa Santé não é apenas uma clínica. É a continuidade de uma história
              construída com coragem, propósito e a certeza de que grandes sonhos nascem,
              crescem e se realizam para impactar muitas outras vidas."
            </p>
            <p className="text-xs text-muted-foreground font-inter">— Dra. Emanuelly Pedrosa</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-lima">
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="font-barlow font-extrabold text-2xl md:text-4xl text-primary-foreground mb-4">
            Faz parte da nossa história<br />começar junto.
          </h2>
          <p className="text-primary-foreground/80 text-sm font-inter mb-8">
            Inauguração em breve em Caruaru-PE. Garanta seu espaço antes de todo mundo.
          </p>
          <Link to="/contato">
            <Button className="bg-background text-foreground hover:bg-background/90 font-inter font-semibold text-sm">
              Quero saber mais
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default QuemSomos;
