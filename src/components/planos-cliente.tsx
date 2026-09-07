"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { PLANOS } from "@/lib/planos";

type Plano = (typeof PLANOS)[number];

export function PlanosCliente({
  planos,
  planoAtual,
  temAssinatura,
}: {
  planos: Plano[];
  planoAtual: string;
  temAssinatura: boolean;
}) {
  const [carregando, setCarregando] = useState<string | null>(null);

  async function assinar(planoId: "pro" | "premium") {
    setCarregando(planoId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoId }),
      });
      const data = await res.json();
      if (data.url) {
        // eslint-disable-next-line react-hooks/immutability -- navegação de página inteira para o Stripe, fora do ciclo de render do React
        window.location.href = data.url;
      } else {
        toast.erro(data.error ?? "Não foi possível iniciar o checkout.");
      }
    } catch {
      toast.erro("Erro de conexão", { descricao: "Não deu para falar com o servidor de pagamento. Tente de novo." });
    } finally {
      setCarregando(null);
    }
  }

  return (
    <div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {planos.map((p) => {
          const ativo = planoAtual === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-surface p-6 transition-shadow",
                p.recomendado ? "border-brand-400 shadow-soft-lg" : "border-ink-200 shadow-soft",
                ativo && "ring-2 ring-brand-300"
              )}
            >
              {p.recomendado && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> Mais escolhido
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-ink-900">{p.nome}</h3>
              <p className="mt-1 flex items-baseline gap-1 font-display text-2xl font-semibold text-ink-900">
                {p.preco}
                {p.periodo && <span className="text-sm font-medium text-ink-400">{p.periodo}</span>}
              </p>
              <p className="mt-1 text-sm text-ink-500">{p.descricao}</p>

              <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm text-ink-600">
                {p.recursos.map((r) => (
                  <li key={r} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {r}
                  </li>
                ))}
              </ul>

              {ativo ? (
                <span className="mt-5 rounded-xl bg-ink-100 px-4 py-2.5 text-center text-sm font-semibold text-ink-500">
                  Plano atual
                </span>
              ) : (
                <Button
                  onClick={() => assinar(p.id as "pro" | "premium")}
                  disabled={carregando === p.id}
                  variant={p.recomendado ? "primary" : "outline"}
                  className="mt-5"
                >
                  {carregando === p.id ? "Redirecionando..." : `Assinar ${p.nome}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {temAssinatura === false && (
        <p className="mt-4 text-xs text-ink-400">Você está no plano gratuito. Assine um plano pago para desbloquear todos os recursos.</p>
      )}
    </div>
  );
}
