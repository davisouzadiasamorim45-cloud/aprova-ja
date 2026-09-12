import Link from "next/link";
import { PenLine, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, cardLinkClass } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { UpsellRedacaoPremium } from "@/components/upsell-redacao-premium";

const STATUS_BADGE: Record<string, { label: string; tone: "success" | "danger" | "gold" }> = {
  corrigida: { label: "Corrigida", tone: "success" },
  erro: { label: "Erro", tone: "danger" },
  pendente: { label: "Corrigindo", tone: "gold" },
};

export default async function RedacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: redacoes }, { data: profile }] = await Promise.all([
    supabase
      .from("redacoes")
      .select("id, tema, status, nota_final, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("plan").eq("id", user!.id).maybeSingle(),
  ]);

  const ehPremium = profile?.plan === "premium";
  const temRedacoes = !!redacoes && redacoes.length > 0;

  return (
    <div>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Redação</h1>
          <p className="mt-1 text-sm text-ink-500">Envie um texto dissertativo-argumentativo e receba feedback por competência.</p>
        </div>
        {ehPremium ? (
          <Link href="/dashboard/redacao/nova" className={buttonClass("primary", "md", "gap-2")}>
            <PenLine className="h-4 w-4" /> Nova redação
          </Link>
        ) : (
          <Link href="/dashboard/planos" className={buttonClass("secondary", "md", "gap-2")}>
            <Sparkles className="h-4 w-4" /> Desbloquear no Premium
          </Link>
        )}
      </div>

      <div className="mt-6">
        {!temRedacoes ? (
          ehPremium ? (
            <Card className="p-10 text-center">
              <PenLine className="mx-auto h-8 w-8 text-ink-300" strokeWidth={1.75} />
              <p className="mt-3 text-ink-600">Você ainda não enviou nenhuma redação.</p>
            </Card>
          ) : (
            <UpsellRedacaoPremium />
          )
        ) : (
          <div className="flex flex-col gap-3">
            {redacoes!.map((r) => {
              const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pendente;
              return (
                <Link
                  key={r.id}
                  href={`/dashboard/redacao/${r.id}`}
                  className={`${cardLinkClass} flex items-center justify-between gap-4 p-4`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{r.tema}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {r.status === "corrigida" && r.nota_final !== null && (
                      <span className="font-display text-lg font-semibold text-brand-700">{r.nota_final}</span>
                    )}
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
