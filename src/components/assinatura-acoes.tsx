"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  cancelarAssinaturaAction,
  reativarAssinaturaAction,
  trocarPlanoAction,
} from "@/lib/stripe/pagamento-actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function BotaoTrocarPlano({ plano, planoAtual, label }: { plano: "pro" | "premium"; planoAtual: string; label: string }) {
  const [state, formAction, pending] = useActionState(trocarPlanoAction, undefined);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  if (plano === planoAtual) return null;

  return (
    <form action={formAction}>
      <input type="hidden" name="plano" value={plano} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Trocando..." : label}
      </Button>
    </form>
  );
}

export function AssinaturaAcoes({
  planoAtual,
  canceladaNoFim,
  fimPeriodo,
}: {
  planoAtual: string;
  canceladaNoFim: boolean;
  fimPeriodo: string | null;
}) {
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
  const [stateCancelar, formActionCancelar, pendingCancelar] = useActionState(cancelarAssinaturaAction, undefined);
  const [stateReativar, formActionReativar, pendingReativar] = useActionState(reativarAssinaturaAction, undefined);

  useEffect(() => {
    if (stateCancelar?.error) toast.erro(stateCancelar.error);
  }, [stateCancelar]);
  useEffect(() => {
    if (stateReativar?.error) toast.erro(stateReativar.error);
  }, [stateReativar]);

  if (planoAtual === "free") return null;

  return (
    <div>
      {canceladaNoFim && fimPeriodo && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-gold-300 bg-gold-50 p-3.5 text-sm text-gold-900 dark:border-gold-800 dark:bg-gold-950/40 dark:text-gold-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            Sua assinatura foi cancelada e continua ativa até <strong>{formatarData(fimPeriodo)}</strong>. Depois disso
            você volta pro plano grátis.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <BotaoTrocarPlano plano="pro" planoAtual={planoAtual} label="Mudar para Pro" />
        <BotaoTrocarPlano plano="premium" planoAtual={planoAtual} label="Mudar para Premium" />

        {canceladaNoFim ? (
          <form action={formActionReativar}>
            <Button type="submit" size="sm" disabled={pendingReativar}>
              {pendingReativar ? "Reativando..." : "Reativar assinatura"}
            </Button>
          </form>
        ) : confirmarCancelamento ? (
          <form action={formActionCancelar} className="flex items-center gap-2">
            <span className="text-xs text-ink-500">Tem certeza?</span>
            <Button type="submit" variant="danger" size="sm" disabled={pendingCancelar}>
              {pendingCancelar ? "Cancelando..." : "Sim, cancelar"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmarCancelamento(false)} disabled={pendingCancelar}>
              Voltar
            </Button>
          </form>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmarCancelamento(true)}>
            Cancelar assinatura
          </Button>
        )}
      </div>
    </div>
  );
}
