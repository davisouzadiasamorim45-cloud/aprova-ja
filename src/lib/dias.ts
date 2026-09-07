// O agrupamento por dia precisa de um fuso fixo: em produção o servidor roda em
// UTC, e quem estuda às 21h de Brasília cairia no dia seguinte. Sem horário de
// verão no Brasil desde 2019, um fuso fixo acerta a esmagadora maioria dos casos
// (AC e parte do AM ficam uma ou duas horas atrás).
const FUSO = "America/Sao_Paulo";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/** Data no formato YYYY-MM-DD, no fuso de referência. */
export function diaLocal(data: Date) {
  return data.toLocaleDateString("en-CA", { timeZone: FUSO });
}

/** As últimas `quantidade` datas (YYYY-MM-DD), da mais antiga para hoje. */
export function ultimosDias(quantidade: number) {
  const agora = Date.now();
  return Array.from({ length: quantidade }, (_, i) => diaLocal(new Date(agora - (quantidade - 1 - i) * UM_DIA_MS)));
}
