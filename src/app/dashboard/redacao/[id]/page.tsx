import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BotaoTentarNovamenteRedacao } from "@/components/botao-tentar-novamente-redacao";
import { NOTA_MAX_COMPETENCIA } from "@/lib/redacao/schema";

type Competencia = { nome: string; nota: number; comentario: string };

export default async function RedacaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: redacao } = await supabase
    .from("redacoes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!redacao) notFound();

  const competencias = (redacao.competencias as unknown as Competencia[] | null) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Correção da redação</h1>
      <p className="mt-1 line-clamp-2 text-sm text-ink-500">{redacao.tema}</p>

      {redacao.status === "erro" && (
        <Card className="mt-6 border-red-200 p-8 text-center dark:border-red-900">
          <p className="text-ink-700">Não foi possível corrigir essa redação agora.</p>
          <p className="mt-1 text-sm text-ink-500">Seu texto está salvo — pode tentar de novo quando quiser.</p>
          <div className="mt-4 flex justify-center">
            <BotaoTentarNovamenteRedacao id={redacao.id} />
          </div>
        </Card>
      )}

      {redacao.status === "pendente" && (
        <Card className="mt-6 flex items-center gap-3 p-6">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
          <p className="text-sm text-ink-500">Corrigindo...</p>
        </Card>
      )}

      {redacao.status === "corrigida" && (
        <div className="mt-6 flex flex-col gap-5">
          <Card className="flex flex-col items-center gap-1 p-8 text-center">
            <p className="text-sm text-ink-500">Nota final (treino)</p>
            <p className="font-display text-5xl font-semibold text-brand-700">{redacao.nota_final}</p>
            <p className="text-xs text-ink-400">de 0 a 10 — não é a nota oficial de nenhuma banca</p>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900">Por competência</h2>
            <div className="mt-4 flex flex-col gap-4">
              {competencias.map((c) => (
                <div key={c.nome}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-ink-800">{c.nome}</span>
                    <span className="shrink-0 text-ink-500">
                      {c.nota.toFixed(1)} / {NOTA_MAX_COMPETENCIA}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(c.nota / NOTA_MAX_COMPETENCIA) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{c.comentario}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-emerald-700 dark:text-emerald-400">Pontos fortes</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-600">
                {(redacao.pontos_fortes ?? []).map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-gold-700">Pontos a melhorar</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-600">
                {(redacao.pontos_a_melhorar ?? []).map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </Card>
          </div>

          {redacao.comentario_geral && (
            <Card className="p-6">
              <h3 className="font-display text-base font-semibold text-ink-900">Comentário geral</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{redacao.comentario_geral}</p>
            </Card>
          )}

          <details className="rounded-2xl border border-ink-200/70 bg-surface p-6">
            <summary className="cursor-pointer font-display text-base font-semibold text-ink-900">
              Ver seu texto original
            </summary>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700">{redacao.texto}</p>
          </details>
        </div>
      )}
    </div>
  );
}
