import Link from "next/link";
import { ArrowRight, CalendarClock, LayoutGrid, Layers, Target, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, cardLinkClass } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { CardRevisarDashboard } from "@/components/card-revisar-dashboard";

function diasRestantes(dataProva: string | null) {
  if (!dataProva) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prova = new Date(dataProva + "T00:00:00");
  const diff = Math.ceil((prova.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle();
  const primeiroNome = profile?.full_name?.split(" ")[0];

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
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        {saudacao()}{primeiroNome ? `, ${primeiroNome}` : ""}
      </h1>
      <p className="mt-1 text-sm text-ink-500">Aqui está o resumo da sua preparação hoje.</p>

      {!meta ? (
        <Card className="mt-6 border-dashed border-brand-300 bg-brand-50/60 p-6 text-center">
          <Target className="mx-auto h-7 w-7 text-brand-600" strokeWidth={1.75} />
          <p className="mt-3 text-sm text-brand-900">Você ainda não escolheu um concurso para focar seus estudos.</p>
          <Link href="/onboarding" className={buttonClass("primary", "md", "mt-4")}>
            Fazer o briefing rápido
          </Link>
        </Card>
      ) : (
        <Card className="mt-6 flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm text-ink-500">Foco atual</p>
            <p className="font-display text-lg font-semibold text-ink-900">{nomeConcurso ?? "Concurso"}</p>
            {restantes !== null && (
              <p className="mt-1 text-sm text-ink-500">
                {restantes >= 0 ? (
                  <>
                    Faltam <span className="font-semibold text-brand-700">{restantes} dias</span> para a prova
                  </>
                ) : (
                  "A data da prova já passou — hora de revisar o edital!"
                )}
              </p>
            )}
          </div>
          {restantes !== null && restantes >= 0 && (
            <div className="hidden shrink-0 flex-col items-center justify-center rounded-2xl bg-gold-50 px-4 py-3 text-center sm:flex">
              <span className="font-display text-2xl font-semibold text-gold-700">{restantes}</span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-gold-600">dias</span>
            </div>
          )}
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <CardRevisarDashboard pendentes={flashcardsPendentes ?? 0} />
        <Link href="/dashboard/estatisticas" className={`${cardLinkClass} flex flex-col p-5`}>
          <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={1.9} />
          <p className="mt-3 text-sm text-ink-500">Taxa de acerto geral</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-900">{taxaAcerto !== null ? `${taxaAcerto}%` : "—"}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
            Ver estatísticas <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
        <Link href="/dashboard/cronograma" className={`${cardLinkClass} flex flex-col p-5`}>
          <CalendarClock className="h-5 w-5 text-brand-600" strokeWidth={1.9} />
          <p className="mt-3 text-sm text-ink-500">Itens no cronograma de hoje</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-900">{itensHoje?.length ?? 0}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
            Ver cronograma <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Hoje no seu cronograma</h2>
        <Card className="mt-3 overflow-hidden">
          {(!itensHoje || itensHoje.length === 0) && (
            <p className="p-5 text-sm text-ink-500">Nada planejado para hoje. Que tal organizar seu cronograma?</p>
          )}
          {itensHoje?.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-ink-100 px-5 py-3 last:border-0">
              <span className={item.concluido ? "text-sm text-ink-400 line-through" : "text-sm text-ink-700"}>{item.titulo}</span>
              <span className="text-xs text-ink-400">{item.duracao_minutos} min</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/questoes" className={`${cardLinkClass} flex items-start gap-4 p-5`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <LayoutGrid className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <p className="font-semibold text-ink-900">Praticar questões</p>
            <p className="mt-1 text-sm text-ink-500">Responda questões filtradas por matéria e veja seu desempenho na hora.</p>
          </div>
        </Link>
        <Link href="/dashboard/flashcards" className={`${cardLinkClass} flex items-start gap-4 p-5`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-700">
            <Layers className="h-5 w-5" strokeWidth={1.9} />
          </div>
          <div>
            <p className="font-semibold text-ink-900">Criar flashcards</p>
            <p className="mt-1 text-sm text-ink-500">Fixe conceitos importantes com repetição espaçada.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
