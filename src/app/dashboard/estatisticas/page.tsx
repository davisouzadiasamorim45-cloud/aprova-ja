import { BarChart3, CheckCircle2, ListChecks, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { GraficoDias } from "@/components/grafico-dias";
import { diaLocal, ultimosDias } from "@/lib/dias";

type TentativaRow = {
  id: string;
  correta: boolean;
  created_at: string;
  questoes: {
    materia_id: string | null;
    materias: { nome: string } | null;
  } | null;
};

export default async function EstatisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("tentativas")
    .select("id, correta, created_at, questoes(materia_id, materias(nome))")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1000);

  const tentativas = (data ?? []) as unknown as TentativaRow[];

  const total = tentativas.length;
  const acertos = tentativas.filter((t) => t.correta).length;
  const taxaGeral = total > 0 ? Math.round((acertos / total) * 100) : 0;

  const porMateria = new Map<string, { nome: string; total: number; acertos: number }>();
  for (const t of tentativas) {
    const nome = t.questoes?.materias?.nome ?? "Sem matéria";
    const chave = t.questoes?.materia_id ?? "sem-materia";
    const atual = porMateria.get(chave) ?? { nome, total: 0, acertos: 0 };
    atual.total += 1;
    if (t.correta) atual.acertos += 1;
    porMateria.set(chave, atual);
  }

  const materiasOrdenadas = [...porMateria.values()].sort((a, b) => b.total - a.total);

  // últimos 14 dias
  const porDia = new Map<string, { total: number; acertos: number }>();
  for (const dia of ultimosDias(14)) {
    porDia.set(dia, { total: 0, acertos: 0 });
  }
  for (const t of tentativas) {
    const atual = porDia.get(diaLocal(new Date(t.created_at)));
    if (atual) {
      atual.total += 1;
      if (t.correta) atual.acertos += 1;
    }
  }

  const dias = [...porDia.entries()].map(([dia, v]) => ({ dia, ...v }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Estatísticas de desempenho</h1>
      <p className="mt-1 text-sm text-ink-500">Baseado nas suas últimas {total} tentativas de questões.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <ListChecks className="h-5 w-5 text-ink-400" strokeWidth={1.9} />
          <p className="mt-3 text-sm text-ink-500">Questões respondidas</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-900">{total}</p>
        </Card>
        <Card className="p-5">
          <CheckCircle2 className="h-5 w-5 text-brand-500" strokeWidth={1.9} />
          <p className="mt-3 text-sm text-ink-500">Acertos</p>
          <p className="mt-1 font-display text-3xl font-semibold text-brand-600">{acertos}</p>
        </Card>
        <Card className="p-5">
          <Target className="h-5 w-5 text-gold-500" strokeWidth={1.9} />
          <p className="mt-3 text-sm text-ink-500">Taxa de acerto</p>
          <p className="mt-1 font-display text-3xl font-semibold text-gold-600">{taxaGeral}%</p>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
          <BarChart3 className="h-4.5 w-4.5 text-ink-400" /> Últimos 14 dias
        </h2>
        <GraficoDias dias={dias} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Desempenho por matéria</h2>
        <Card className="mt-3 overflow-hidden">
          {materiasOrdenadas.length === 0 && (
            <p className="p-5 text-sm text-ink-500">
              Você ainda não respondeu nenhuma questão. Vá para o Banco de questões para começar.
            </p>
          )}
          {materiasOrdenadas.map((m) => {
            const taxa = m.total > 0 ? Math.round((m.acertos / m.total) * 100) : 0;
            return (
              <div key={m.nome} className="flex items-center gap-4 border-b border-ink-100 px-5 py-3 last:border-0">
                <span className="w-40 shrink-0 truncate text-sm font-medium text-ink-700">{m.nome}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full ${taxa >= 70 ? "bg-brand-500" : taxa >= 50 ? "bg-gold-500" : "bg-red-500"}`}
                    style={{ width: `${taxa}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-sm text-ink-500">
                  {m.acertos}/{m.total} ({taxa}%)
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
