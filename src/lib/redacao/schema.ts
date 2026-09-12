import { z } from "zod";

/**
 * As 5 competências avaliadas em toda correção, nessa ordem — fixadas aqui
 * (não deixamos o modelo escolher os nomes) pra manter a correção comparável
 * entre redações diferentes. O prompt do sistema (ver prompt.ts) instrui a IA
 * a devolver exatamente esses 5 nomes, nessa ordem.
 */
export const COMPETENCIAS = [
  "Domínio da norma culta",
  "Compreensão do tema e da proposta",
  "Argumentação e desenvolvimento",
  "Coesão e coerência textual",
  "Conclusão e proposta de intervenção",
] as const;

/** Nota máxima de cada competência — 5 competências × 2,0 = nota final até 10. */
export const NOTA_MAX_COMPETENCIA = 2;

const CompetenciaSchema = z.object({
  nome: z.string().describe("Nome exato da competência avaliada, igual ao da lista fornecida"),
  nota: z
    .number()
    .min(0)
    .max(NOTA_MAX_COMPETENCIA)
    .describe("Nota de 0 a 2, podendo usar meios pontos (0, 0.5, 1, 1.5, 2)"),
  comentario: z
    .string()
    .describe("Comentário específico sobre essa competência, citando trechos do texto quando fizer sentido"),
});

/** Formato estruturado que a IA devolve — ver src/lib/redacao/prompt.ts para o prompt que o ancora. */
export const CorrecaoRedacaoSchema = z.object({
  competencias: z.array(CompetenciaSchema).length(COMPETENCIAS.length),
  pontos_fortes: z.array(z.string()).min(1).max(4),
  pontos_a_melhorar: z.array(z.string()).min(1).max(4),
  comentario_geral: z.string().describe("Parágrafo curto resumindo a avaliação geral do texto"),
});

export type CorrecaoRedacao = z.infer<typeof CorrecaoRedacaoSchema>;
