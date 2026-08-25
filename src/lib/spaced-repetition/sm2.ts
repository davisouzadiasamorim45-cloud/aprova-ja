/**
 * Implementação simplificada do algoritmo SM-2 (SuperMemo 2) de repetição
 * espaçada, usado por ferramentas como o Anki.
 *
 * qualidade: 0-5, onde:
 *   0-2 = errou / não lembrou
 *   3   = lembrou com dificuldade
 *   4   = lembrou bem
 *   5   = lembrou com facilidade
 */
export type EstadoFlashcard = {
  intervalo_dias: number;
  fator_facilidade: number;
  repeticoes: number;
};

export function calcularProximaRevisao(estado: EstadoFlashcard, qualidade: number) {
  let { intervalo_dias, fator_facilidade, repeticoes } = estado;

  if (qualidade < 3) {
    // Errou: reinicia o ciclo de repetições, mas mantém o fator de facilidade.
    repeticoes = 0;
    intervalo_dias = 1;
  } else {
    repeticoes += 1;
    if (repeticoes === 1) {
      intervalo_dias = 1;
    } else if (repeticoes === 2) {
      intervalo_dias = 6;
    } else {
      intervalo_dias = Math.round(intervalo_dias * fator_facilidade);
    }
  }

  fator_facilidade = Math.max(
    1.3,
    fator_facilidade + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02))
  );

  const proximaRevisao = new Date();
  proximaRevisao.setDate(proximaRevisao.getDate() + intervalo_dias);

  return {
    intervalo_dias,
    fator_facilidade: Number(fator_facilidade.toFixed(2)),
    repeticoes,
    proxima_revisao: proximaRevisao.toISOString().slice(0, 10),
  };
}
