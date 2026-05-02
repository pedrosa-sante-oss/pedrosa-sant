import { supabase } from "@/integrations/supabase/client";

export interface WebhookBookingPayload {
  locador_nome: string;
  locador_telefone: string | null;
  locador_especialidade: string | null;
  sala: string;
  data: string;
  periodo: string;
  origem: "portal_locador" | "secretaria";
}

const PERIOD_LABELS: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  dia_todo: "Dia todo",
};

export async function sendBookingWebhook(payload: WebhookBookingPayload): Promise<void> {
  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["datacrazy_webhook_url", "datacrazy_api_key"]);

  if (!settings) return;

  const url = settings.find((s) => s.key === "datacrazy_webhook_url")?.value;
  const key = settings.find((s) => s.key === "datacrazy_api_key")?.value;

  if (!url) return;

  const body = {
    evento: "pedido_reserva",
    locador_nome: payload.locador_nome,
    locador_telefone: payload.locador_telefone ?? "",
    locador_especialidade: payload.locador_especialidade ?? "",
    sala: payload.sala,
    data: payload.data,
    periodo: PERIOD_LABELS[payload.periodo] ?? payload.periodo,
    origem: payload.origem === "portal_locador" ? "Portal do Locador" : "Secretaria",
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Webhook failure is non-blocking — booking was already saved
  }
}
