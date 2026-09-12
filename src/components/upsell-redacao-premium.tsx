import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";

/** Tela mostrada em /dashboard/redacao e /nova pra quem não está no plano Premium. */
export function UpsellRedacaoPremium() {
  return (
    <Card className="border-gold-300 p-10 text-center">
      <span className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-ink-900">
        <Sparkles className="h-3.5 w-3.5" /> Recurso Premium
      </span>
      <p className="mx-auto mt-4 max-w-md font-display text-lg font-semibold text-ink-900">
        Correção de redação com IA
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
        Envie sua redação — digitada ou por foto de um texto manuscrito — e receba feedback por
        competência, nos moldes de uma banca de concurso. Disponível no plano Premium.
      </p>
      <Link href="/dashboard/planos" className={buttonClass("secondary", "md", "mt-5")}>
        Ver plano Premium
      </Link>
    </Card>
  );
}
