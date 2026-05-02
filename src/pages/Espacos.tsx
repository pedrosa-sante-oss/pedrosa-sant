import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wifi, Zap, Droplets, Users, AirVent } from "lucide-react";
import LeadFormModal from "@/components/LeadFormModal";

const included = [
  { icon: Zap, label: "Energia elétrica" },
  { icon: Droplets, label: "Água" },
  { icon: Wifi, label: "Wi-Fi de alta velocidade" },
  { icon: Users, label: "Recepção" },
];

const regularRooms = [
  { title: "Sala 01", desc: "Sala versátil e ampla, ideal para consultas médicas e atendimentos clínicos. Espaço projetado com foco em conforto e funcionalidade para o profissional de saúde.", image: "/renders/consultorio.jpg" },
  { title: "Sala 02", desc: "Ambiente acolhedor e intimista, perfeito para psicologia, nutrição e terapias. Design que favorece a privacidade e o bem-estar do paciente.", image: "/renders/consultorio.jpg" },
  { title: "Sala 03", desc: "Espaço funcional e elegante para diversas especialidades de saúde. Infraestrutura pensada para atendimentos que exigem sofisticação.", image: "/renders/consultorio.jpg" },
];

const Espacos = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRoom, setModalRoom] = useState("");

  const openModal = (room: string) => {
    setModalRoom(room);
    setModalOpen(true);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 py-24">
        <img src="/renders/recepcao-04.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-primary/72" aria-hidden="true" />
        <span className="absolute text-[20rem] md:text-[35rem] font-barlow font-extrabold text-gold opacity-[0.04] select-none pointer-events-none leading-none z-10">§</span>
        <div className="relative z-10 text-center max-w-2xl animate-fade-in-up">
          <h1 className="font-barlow font-extrabold text-3xl md:text-5xl mb-4">Quatro ambientes de <span className="text-lima">alto padrão</span></h1>
          <p className="text-muted-foreground font-inter text-sm md:text-base">Cada sala foi projetada para oferecer o melhor ambiente para seus pacientes e para o seu trabalho.</p>
        </div>
      </section>

      {/* SALAS REGULARES */}
      {regularRooms.map((room, i) => (
        <section key={room.title} className={`py-20 px-4 ${i % 2 === 1 ? "bg-surface" : ""}`}>
          <div className={`container mx-auto grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <img src={room.image} alt={room.title} className="w-full aspect-video object-cover" />
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>
              <h2 className="font-barlow font-extrabold text-2xl md:text-3xl mb-4">{room.title}</h2>
              <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-6">{room.desc}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {included.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground font-inter">
                    <item.icon className="h-4 w-4 text-lima" />
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground font-inter">
                <AirVent className="h-4 w-4 text-gold" />
                O profissional instala ar condicionado inverter próprio e mobília
              </div>
              <p className="text-xs text-muted-foreground font-inter mb-6">Regime: day use ou turno mensal</p>
              <Button onClick={() => openModal(room.title)} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-sm font-semibold">
                Tenho interesse nesta sala
              </Button>
            </div>
          </div>
        </section>
      ))}

      {/* SALA ODONTOLÓGICA */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img src="/renders/sala-dentista.jpg" alt="Sala Odontológica" className="w-full aspect-video object-cover" />
          </div>
          <div>
            <span className="text-xs font-inter text-lima tracking-wider uppercase mb-2 block">Destaque</span>
            <h2 className="font-barlow font-extrabold text-2xl md:text-3xl mb-4">Sala Odontológica</h2>
            <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-4">
              Para dentistas que querem atender sem montar clínica própria. Equipamento completo para atendimento odontológico de alto padrão.
            </p>
            <p className="text-muted-foreground font-inter text-sm leading-relaxed mb-6">
              Inclui toda infraestrutura necessária: cadeira odontológica, compressor, sugador, refletor, além de energia elétrica, água, Wi-Fi e recepção.
            </p>
            <Button onClick={() => openModal("Sala Odontológica")} className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-sm font-semibold">
              Tenho interesse
            </Button>
          </div>
        </div>
      </section>

      <LeadFormModal open={modalOpen} onOpenChange={setModalOpen} defaultRoom={modalRoom} />
    </>
  );
};

export default Espacos;
