import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5587993123121";
const MESSAGE = "Olá! Vi o site da Pedrosa Santé e tenho interesse em saber mais sobre as salas.";

const WhatsAppButton = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-lima shadow-lg transition-transform hover:scale-110"
    aria-label="WhatsApp"
  >
    <MessageCircle className="h-6 w-6 text-primary-foreground" />
  </a>
);

export default WhatsAppButton;
