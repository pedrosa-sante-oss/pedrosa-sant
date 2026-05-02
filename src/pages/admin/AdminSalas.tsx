import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Save, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  sort_order: number;
}

const AdminSalas = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [edited, setEdited] = useState<Record<string, Partial<Room>>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("sort_order");
    if (data) setRooms(data);
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleChange = (id: string, field: keyof Room, value: string) => {
    setEdited((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (room: Room) => {
    const changes = edited[room.id];
    if (!changes) return;
    const { error } = await supabase.from("rooms").update(changes).eq("id", room.id);
    if (error) { toast.error("Erro ao salvar."); return; }
    toast.success(`${room.name} atualizada.`);
    const copy = { ...edited };
    delete copy[room.id];
    setEdited(copy);
    fetchRooms();
  };

  const handleUpload = async (room: Room, file: File) => {
    if (!file) return;
    setUploading(room.id);

    const ext = file.name.split(".").pop();
    const path = `${room.id}.${ext}?t=${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from("room-photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error("Erro ao fazer upload: " + uploadError.message);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("room-photos")
      .getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("rooms")
      .update({ photo_url: publicUrl })
      .eq("id", room.id);

    setUploading(null);

    if (updateError) { toast.error("Erro ao salvar URL da foto."); return; }
    toast.success(`Foto de ${room.name} atualizada.`);
    fetchRooms();
  };

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-2">Salas</h1>
      <p className="text-xs text-muted-foreground font-inter mb-8">
        Edite o nome, descrição e foto de cada sala. As fotos são usadas no site público.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const e = edited[room.id] ?? {};
          const isDirty = Object.keys(e).length > 0;
          const photoUrl = room.photo_url?.startsWith("http")
            ? room.photo_url
            : room.photo_url;

          return (
            <div key={room.id} className="border border-border bg-surface rounded overflow-hidden">
              {/* Photo area */}
              <div className="relative group aspect-video bg-card overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-2"
                    onClick={() => fileRefs.current[room.id]?.click()}
                    disabled={uploading === room.id}
                  >
                    <Upload className="h-3 w-3" />
                    {uploading === room.id ? "Enviando..." : "Trocar foto"}
                  </Button>
                </div>
                <input
                  ref={(el) => { fileRefs.current[room.id] = el; }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(ev) => {
                    const f = ev.target.files?.[0];
                    if (f) handleUpload(room, f);
                    ev.target.value = "";
                  }}
                />
              </div>

              {/* Fields */}
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider block mb-1">Nome</label>
                  <Input
                    value={e.name ?? room.name}
                    onChange={(ev) => handleChange(room.id, "name", ev.target.value)}
                    className="bg-background border-border font-inter text-sm h-9"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-inter uppercase tracking-wider block mb-1">Descrição</label>
                  <Input
                    value={e.description ?? (room.description ?? "")}
                    onChange={(ev) => handleChange(room.id, "description", ev.target.value)}
                    className="bg-background border-border font-inter text-sm h-9"
                    placeholder="Descrição breve da sala..."
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSave(room)}
                  disabled={!isDirty}
                  className="w-full bg-lima text-primary-foreground hover:bg-lima/90 font-inter text-xs gap-2 disabled:opacity-40"
                >
                  <Save className="h-3 w-3" />
                  Salvar alterações
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {rooms.length === 0 && (
        <p className="text-sm text-muted-foreground font-inter text-center py-20">
          Nenhuma sala encontrada. Execute o SQL de migração no Supabase.
        </p>
      )}
    </div>
  );
};

export default AdminSalas;
