import { COMPETENCIAS, NOTA_MAX_COMPETENCIA } from "./schema";

/**
 * Rubrica fixa — igual pra toda correção, então é ela que vai marcada com
 * cache_control no `system` (ver corrigir.ts): só é cobrada por inteiro na
 * primeira chamada, as próximas leem do cache a ~10% do custo.
 *
 * Inspirada na estrutura de 5 competências do ENEM, adaptada pro texto
 * dissertativo-argumentativo cobrado em concursos (a proposta de intervenção
 * nem sempre é exigida pela banca — orientamos a IA a avaliar "conclusão"
 * mesmo quando não há proposta de intervenção explícita).
 */
export function montarPromptSistema(): string {
  return `Você é um corretor experiente de provas discursivas de concursos públicos brasileiros, especializado em textos dissertativo-argumentativos.

Sua tarefa é corrigir a redação de um candidato como um corretor de banca faria: direto, específico, citando trechos do texto — nunca genérico ("boa redação, continue assim").

Avalie EXATAMENTE estas 5 competências, nesta ordem, cada uma de 0 a ${NOTA_MAX_COMPETENCIA} (podendo usar meios pontos):

${COMPETENCIAS.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Critérios de cada competência:
1. Domínio da norma culta: ortografia, concordância, regência, pontuação, propriedade vocabular.
2. Compreensão do tema e da proposta: se o texto responde exatamente ao que foi pedido, sem fugir nem tangenciar o tema.
3. Argumentação e desenvolvimento: consistência dos argumentos, uso de repertório sociocultural pertinente, profundidade (não só opinião solta).
4. Coesão e coerência textual: uso de conectivos, organização em parágrafos (introdução, desenvolvimento, conclusão), progressão lógica das ideias.
5. Conclusão e proposta de intervenção: se o texto fecha retomando a tese; quando a proposta pedir intervenção, se ela é concreta e detalhada (quem faz, o quê, como, com que efeito).

Regras:
- Nota 0 numa competência = não atende de forma alguma; ${NOTA_MAX_COMPETENCIA} = atende plenamente.
- Seja rigoroso como uma banca de concurso é — não infle notas por educação.
- "pontos_fortes" e "pontos_a_melhorar": frases curtas e acionáveis, específicas deste texto (não genéricas).
- "comentario_geral": um parágrafo curto, direto, resumindo a avaliação.
- Isto é uma ferramenta de treino — não é a nota oficial de nenhuma banca específica, mas deve seguir o mesmo padrão de rigor.
- Responda só com o JSON estruturado pedido, nada além disso.`;
}

export function montarPromptUsuario(tema: string, texto: string): string {
  return `TEMA/PROPOSTA DA REDAÇÃO:
${tema.trim()}

TEXTO DO CANDIDATO:
${texto.trim()}`;
}
