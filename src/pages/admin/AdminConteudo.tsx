import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
}

const AdminConteudo = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("site_content").select("*").order("section").then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  const sections = [...new Set(items.map((i) => i.section))];

  const handleSave = async (item: ContentItem) => {
    const newValue = edited[item.id];
    if (newValue === undefined || newValue === item.value) return;
    const { error } = await supabase.from("site_content").update({ value: newValue, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (error) { toast.error("Erro ao salvar."); return; }
    toast.success(`"${item.key}" atualizado.`);
    setItems(items.map((i) => i.id === item.id ? { ...i, value: newValue } : i));
    const copy = { ...edited };
    delete copy[item.id];
    setEdited(copy);
  };

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-8">Conteúdo do Site</h1>
      {sections.map((section) => (
        <div key={section} className="mb-10">
          <h2 className="font-barlow font-bold text-sm text-lima mb-4 uppercase tracking-wider">{section}</h2>
          <div className="space-y-3">
            {items.filter((i) => i.section === section).map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <span className="text-xs text-muted-foreground font-inter w-40 shrink-0">{item.key}</span>
                <Input
                  value={edited[item.id] ?? item.value}
                  onChange={(e) => setEdited({ ...edited, [item.id]: e.target.value })}
                  className="bg-surface border-border font-inter text-sm flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSave(item)}
                  disabled={edited[item.id] === undefined || edited[item.id] === item.value}
                  className="border-border shrink-0"
                >
                  <Save className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground font-inter">Nenhum conteúdo cadastrado.</p>}
    </div>
  );
};

export default AdminConteudo;
