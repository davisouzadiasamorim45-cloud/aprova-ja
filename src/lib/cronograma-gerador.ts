// Gera uma sugestão de cronograma semanal recorrente (por dia_semana, sem data
// fixa — mesmo modelo usado em /dashboard/cronograma) a partir das matérias do
// edital, dos dias da semana que a pessoa tem disponível e de qual matéria ela
// apontou como maior dificuldade.

export type MateriaSimples = { id: string; nome: string };

export type ItemCronogramaGerado = {
  materia_id: string;
  materia_nome: string;
  dia_semana: number; // 0=domingo ... 6=sábado
  duracao_minutos: number;
};

export const NOMES_DIA_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Monta uma fila de matérias em round-robin, dando duas passadas para a
 * matéria de maior dificuldade (aparece com o dobro da frequência das
 * demais) sem empilhar a mesma matéria em dias seguidos.
 */
function filaPonderada(materias: MateriaSimples[], materiaDificilId: string | null): MateriaSimples[] {
  const restantes = materias.map((m) => ({ materia: m, vezes: m.id === materiaDificilId ? 2 : 1 }));
  const fila: MateriaSimples[] = [];
  while (restantes.some((r) => r.vezes > 0)) {
    for (const r of restantes) {
      if (r.vezes > 0) {
        fila.push(r.materia);
        r.vezes--;
      }
    }
  }
  return fila;
}

export function gerarCronogramaSemanal({
  materias,
  diasSemana,
  materiaDificilId,
  horasPorDia,
}: {
  materias: MateriaSimples[];
  diasSemana: number[];
  materiaDificilId: string | null;
  horasPorDia: number;
}): ItemCronogramaGerado[] {
  if (materias.length === 0 || diasSemana.length === 0) return [];

  const fila = filaPonderada(materias, materiaDificilId);
  const diasOrdenados = [...diasSemana].sort((a, b) => a - b);
  const duracaoMinutos = Math.max(30, Math.round(horasPorDia * 60));

  return diasOrdenados.map((dia, i) => {
    const materia = fila[i % fila.length];
    return {
      materia_id: materia.id,
      materia_nome: materia.nome,
      dia_semana: dia,
      duracao_minutos: duracaoMinutos,
    };
  });
}
