import Anthropic from "@anthropic-ai/sdk";

let anthropicInstance: Anthropic | null = null;

/**
 * Cliente Anthropic (lazy) — mesma ideia do getStripe(): não quebra o build
 * nem outras páginas quando a chave ainda não foi configurada.
 */
export function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY não configurada. Defina a variável de ambiente (veja README.md)."
      );
    }
    anthropicInstance = new Anthropic({ apiKey: key });
  }
  return anthropicInstance;
}

/** Modelo usado nas features de IA — trocar aqui vale pro app inteiro. */
export const MODELO_PADRAO = "claude-sonnet-5";
