export const DEFAULT_LAMP_MODEL = "grok-4.5";

export function lampModelId(): string {
  const fromProcess =
    typeof process !== "undefined"
      ? String(process.env.XAI_MODEL ?? process.env.VITE_XAI_MODEL ?? "").trim()
      : "";
  let fromVite = "";
  try {
    fromVite = String(
      (import.meta as { env?: { VITE_XAI_MODEL?: string } }).env?.VITE_XAI_MODEL ?? "",
    ).trim();
  } catch {
    fromVite = "";
  }
  return fromProcess || fromVite || DEFAULT_LAMP_MODEL;
}
