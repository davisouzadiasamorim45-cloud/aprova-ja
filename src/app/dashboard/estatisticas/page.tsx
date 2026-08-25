import { createClient } from "@/lib/supabase/server";

type TentativaRow = {
  id: string;
  correta: boolean;
  created_at: string;
  questoes: {
    materia_id: string | null;
    materias: { nome: string } | null;
  } | null;
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

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
  const hoje = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    porDia.set(d.toISOString().slice(0, 10), { total: 0, acertos: 0 });
  }
  for (const t of tentativas) {
    const chave = t.created_at.slice(0, 10);
    if (porDia.has(chave)) {
      const atual = porDia.get(chave)!;
      atual.total += 1;
      if (t.correta) atual.acertos += 1;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Estatísticas de desempenho</h1>
      <p className="mt-1 text-sm text-slate-500">Baseado nas suas últimas {total} tentativas de questões.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Questões respondidas</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Acertos</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{acertos}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Taxa de acerto</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{taxaGeral}%</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Últimos 14 dias</h2>
        <div className="mt-3 flex h-32 items-end gap-1.5 rounded-2xl border border-slate-200 bg-white p-4">
          {[...porDia.entries()].map(([dia, v]) => {
            const altura = v.total > 0 ? Math.max(8, (v.total / Math.max(...[...porDia.values()].map((x) => x.total), 1)) * 100) : 4;
            const taxa = v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0;
            return (
              <div key={dia} className="flex flex-1 flex-col items-center gap-1" title={`${v.total} questões, ${taxa}% de acerto`}>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-indigo-500"
                    style={{ height: `${altura}%`, opacity: v.total > 0 ? 1 : 0.15 }}
                  />
                </div>
                <span className="text-[9px] text-slate-400">{formatarData(dia)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Desempenho por matéria</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {materiasOrdenadas.length === 0 && (
            <p className="p-5 text-sm text-slate-500">
              Você ainda não respondeu nenhuma questão. Vá para o Banco de questões para começar.
            </p>
          )}
          {materiasOrdenadas.map((m) => {
            const taxa = m.total > 0 ? Math.round((m.acertos / m.total) * 100) : 0;
            return (
              <div key={m.nome} className="flex items-center gap-4 border-b border-slate-100 px-5 py-3 last:border-0">
                <span className="w-40 shrink-0 truncate text-sm font-medium text-slate-700">{m.nome}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${taxa >= 70 ? "bg-emerald-500" : taxa >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${taxa}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-sm text-slate-500">
                  {m.acertos}/{m.total} ({taxa}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
