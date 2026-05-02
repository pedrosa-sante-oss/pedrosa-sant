import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultRoom?: string;
}

const specialties = ["Odontologia", "Medicina", "Psicologia", "Nutrição", "Fisioterapia", "Outra"];
const rooms = ["Sala 01", "Sala 02", "Sala 03", "Sala Odontológica", "Qualquer disponível"];

const LeadFormModal = ({ open, onOpenChange, defaultRoom }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    room_interest: defaultRoom || "",
    message: "",
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
      toast.success("Interesse registrado! Entraremos em contato em breve.");
      setForm({ name: "", email: "", phone: "", specialty: "", room_interest: defaultRoom || "", message: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-barlow font-bold text-xl">Tenho Interesse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Nome completo *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border" />
          <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v })}>
            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Especialidade *" /></SelectTrigger>
            <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.room_interest} onValueChange={(v) => setForm({ ...form, room_interest: v })}>
            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Sala de interesse" /></SelectTrigger>
            <SelectContent>{rooms.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="WhatsApp com DDD *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
          <Input type="email" placeholder="E-mail *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-border" />
          <Textarea placeholder="Mensagem (opcional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-background border-border" />
          <Button type="submit" disabled={loading} className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter font-semibold">
            {loading ? "Enviando..." : "Quero ser contatado"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
