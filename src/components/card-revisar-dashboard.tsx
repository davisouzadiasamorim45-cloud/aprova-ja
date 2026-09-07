import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { cardLinkClass } from "@/components/ui/card";

/**
 * Card do dashboard. Com pendências, abre direto a revisão. Sem pendências,
 * manda para a página de Flashcards com `?tudoemdia=1`, que dispara o aviso +
 * confete por lá — em vez de abrir a tela de revisão vazia.
 */
export function CardRevisarDashboard({ pendentes }: { pendentes: number }) {
  const href = pendentes > 0 ? "/dashboard/flashcards/revisar" : "/dashboard/flashcards?tudoemdia=1";

  return (
    <Link href={href} className={`${cardLinkClass} flex flex-col p-5`}>
      <Layers className="h-5 w-5 text-brand-600" strokeWidth={1.9} />
      <p className="mt-3 text-sm text-ink-500">Flashcards para revisar hoje</p>
      <p className="mt-1 font-display text-3xl font-semibold text-ink-900">{pendentes}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
        {pendentes > 0 ? "Revisar agora" : "Tudo em dia"}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
