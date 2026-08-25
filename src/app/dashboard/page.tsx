import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function diasRestantes(dataProva: string | null) {
  if (!dataProva) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prova = new Date(dataProva + "T00:00:00");
  const diff = Math.ceil((prova.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hoje = new Date().toISOString().slice(0, 10);
  const diaSemanaHoje = new Date().getDay();

  const [{ data: meta }, { count: flashcardsPendentes }, { data: itensHoje }, { count: totalTentativas }, { count: totalAcertos }] =
    await Promise.all([
      supabase
        .from("metas_concurso")
        .select("data_prova, horas_semanais_meta, concursos(nome)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("flashcards").select("id", { count: "exact", head: true }).eq("user_id", user!.id).lte("proxima_revisao", hoje),
      supabase
        .from("cronograma_itens")
        .select("id, titulo, duracao_minutos, concluido")
        .eq("user_id", user!.id)
        .eq("dia_semana", diaSemanaHoje),
      supabase.from("tentativas").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("tentativas").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("correta", true),
    ]);

  const metaTipada = meta as { data_prova: string | null; concursos?: { nome?: string } } | null;
  const restantes = diasRestantes(metaTipada?.data_prova ?? null);
  const taxaAcerto = totalTentativas && totalTentativas > 0 ? Math.round(((totalAcertos ?? 0) / totalTentativas) * 100) : null;
  const nomeConcurso = metaTipada?.concursos?.nome;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Olá! 👋</h1>
      <p className="mt-1 text-sm text-slate-500">Aqui está o resumo da sua preparação hoje.</p>

      {!meta ? (
        <div className="mt-6 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-6 text-center">
          <p className="text-sm text-indigo-800">Você ainda não escolheu um concurso para focar seus estudos.</p>
          <Link href="/onboarding" className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Fazer o briefing rápido
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Foco atual</p>
          <p className="text-lg font-semibold text-slate-900">{nomeConcurso ?? "Concurso"}</p>
          {restantes !== null && (
            <p className="mt-1 text-sm text-slate-500">
              {restantes >= 0 ? (
                <>
                  Faltam <span className="font-semibold text-indigo-600">{restantes} dias</span> para a prova
                </>
              ) : (
                "A data da prova já passou — hora de revisar o edital!"
              )}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Flashcards para revisar hoje</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{flashcardsPendentes ?? 0}</p>
          <Link href="/dashboard/flashcards/revisar" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
            Revisar agora →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Taxa de acerto geral</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{taxaAcerto !== null ? `${taxaAcerto}%` : "—"}</p>
          <Link href="/dashboard/estatisticas" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
            Ver estatísticas →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Itens no cronograma de hoje</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{itensHoje?.length ?? 0}</p>
          <Link href="/dashboard/cronograma" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
            Ver cronograma →
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Hoje no seu cronograma</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {(!itensHoje || itensHoje.length === 0) && (
            <p className="p-5 text-sm text-slate-500">Nada planejado para hoje. Que tal organizar seu cronograma?</p>
          )}
          {itensHoje?.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-slate-100 px-5 py-3 last:border-0">
              <span className={item.concluido ? "text-sm text-slate-400 line-through" : "text-sm text-slate-700"}>{item.titulo}</span>
              <span className="text-xs text-slate-400">{item.duracao_minutos} min</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/questoes" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm">
          <p className="font-semibold text-slate-900">📝 Praticar questões</p>
          <p className="mt-1 text-sm text-slate-500">Responda questões filtradas por matéria e veja seu desempenho na hora.</p>
        </Link>
        <Link href="/dashboard/flashcards" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm">
          <p className="font-semibold text-slate-900">🧠 Criar flashcards</p>
          <p className="mt-1 text-sm text-slate-500">Fixe conceitos importantes com repetição espaçada.</p>
        </Link>
      </div>
    </div>
  );
}
