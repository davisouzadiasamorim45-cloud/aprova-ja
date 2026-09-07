"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pause, Play, Square } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { lerPreferencias } from "@/lib/preferencias-estudo";
import { formatarDuracao, useAlarmeTimer, useTimerEstudo } from "@/components/cronograma-timer";

/**
 * Fica montado no layout do dashboard: é ele que dispara o alarme (por isso
 * precisa existir em toda tela) e mostra um cronômetro discreto no canto
 * enquanto a pessoa está em outra página. No próprio cronograma ele some, já
 * que lá o painel completo aparece no topo.
 */
export function TimerFlutuante() {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();
  const timer = useTimerEstudo();

  useAlarmeTimer(timer.atingiuMeta, timer.alertado);

  if (!timer.itemAtivoId || pathname === "/dashboard/cronograma") return null;

  async function parar() {
    const itemId = timer.itemAtivoId;
    timer.parar();
    if (itemId && lerPreferencias().concluirAoParar) {
      await supabase.from("cronograma_itens").update({ concluido: true }).eq("id", itemId);
    }
  }

  const progresso = timer.metaMs > 0 ? Math.min(1, timer.decorridoMs / timer.metaMs) : 0;

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-20 right-4 z-20 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-surface shadow-soft-lg md:bottom-6 md:right-6",
        timer.atingiuMeta ? "border-gold-400" : "border-brand-300"
      )}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <Link href="/dashboard/cronograma" className="min-w-0 flex-1" title="Abrir o cronograma">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                timer.atingiuMeta ? "bg-gold-500" : timer.rodando ? "animate-pulse bg-brand-500" : "bg-ink-400"
              )}
            />
            {timer.atingiuMeta ? "Meta atingida" : timer.rodando ? "Estudando" : "Pausado"}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-ink-800">{timer.titulo}</p>
        </Link>

        <p
          className={cn(
            "shrink-0 font-display text-xl font-semibold tabular-nums",
            timer.atingiuMeta ? "text-gold-700" : "text-brand-700"
          )}
        >
          {formatarDuracao(timer.decorridoMs)}
        </p>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={timer.alternarPausa}
            aria-label={timer.rodando ? "Pausar cronômetro" : "Retomar cronômetro"}
            className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-brand-700"
          >
            {timer.rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={parar}
            aria-label="Parar cronômetro"
            className="rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-red-600"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-1 bg-ink-100">
        <div
          className={cn("h-full transition-[width] duration-500", timer.atingiuMeta ? "bg-gold-500" : "bg-brand-500")}
          style={{ width: `${progresso * 100}%` }}
        />
      </div>
    </div>
  );
}
