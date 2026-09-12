import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropic, MODELO_PADRAO } from "@/lib/anthropic/client";
import { CorrecaoRedacaoSchema, type CorrecaoRedacao } from "./schema";
import { montarPromptSistema, montarPromptUsuario } from "./prompt";

export type ResultadoCorrecao = CorrecaoRedacao & { nota_final: number };

/**
 * Chama a Claude pra corrigir uma redação e devolve o resultado já validado
 * contra o schema. A nota final é somada aqui (não confiamos na aritmética do
 * modelo) e arredondada em 1 casa decimal.
 *
 * Lança erro se ANTHROPIC_API_KEY não estiver configurada, se a chamada
 * falhar, ou se a resposta não bater com o schema esperado — quem chama
 * decide como tratar (ver actions.ts).
 */
export async function corrigirRedacao(tema: string, texto: string): Promise<ResultadoCorrecao> {
  const client = getAnthropic();

  const message = await client.messages.parse({
    model: MODELO_PADRAO,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: montarPromptSistema(),
        // Rubrica idêntica em toda correção — cacheada pra ficar barata.
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: montarPromptUsuario(tema, texto) }],
    output_config: {
      effort: "medium",
      format: zodOutputFormat(CorrecaoRedacaoSchema),
    },
  });

  if (!message.parsed_output) {
    throw new Error("A IA não devolveu uma correção no formato esperado.");
  }

  const notaFinal =
    Math.round(message.parsed_output.competencias.reduce((soma, c) => soma + c.nota, 0) * 10) / 10;

  return { ...message.parsed_output, nota_final: notaFinal };
}
