"use client";

import { useSyncExternalStore } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type TomToast = "sucesso" | "erro" | "info";

type Toast = {
  id: number;
  tom: TomToast;
  titulo: string;
  descricao?: string;
  duracaoMs: number;
};

type OpcoesToast = { descricao?: string; duracaoMs?: number };

const DURACAO_PADRAO: Record<TomToast, number> = {
  sucesso: 5000,
  info: 5000,
  // Erro fica mais tempo: normalmente traz uma instrução para ler com calma.
  erro: 7000,
};

/** Mais que isso vira parede de aviso; os antigos saem para o novo entrar. */
const MAXIMO_NA_TELA = 3;

// ---------------------------------------------------------------------------
// Store fora do React (mesma ideia do cronômetro): assim `toast.erro(...)` pode
// ser chamado de qualquer lugar — inclusive de funções assíncronas fora de
// componentes — sem precisar de context nem de prop drilling.
// ---------------------------------------------------------------------------
let toasts: Toast[] = [];
const VAZIO: Toast[] = [];
const ouvintes = new Set<() => void>();
const temporizadores = new Map<number, number>();
let proximoId = 1;

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

function inscrever(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function obterToasts() {
  return toasts;
}

function obterToastsNoServidor() {
  return VAZIO;
}

function limparTemporizador(id: number) {
  const t = temporizadores.get(id);
  if (t !== undefined) {
    window.clearTimeout(t);
    temporizadores.delete(id);
  }
}

export function fecharToast(id: number) {
  limparTemporizador(id);
  toasts = toasts.filter((t) => t.id !== id);
  avisar();
}

function adicionar(tom: TomToast, titulo: string, opcoes?: OpcoesToast) {
  const id = proximoId++;
  const duracaoMs = opcoes?.duracaoMs ?? DURACAO_PADRAO[tom];
  const novo: Toast = { id, tom, titulo, descricao: opcoes?.descricao, duracaoMs };

  const excedentes = [...toasts, novo].slice(0, Math.max(0, toasts.length + 1 - MAXIMO_NA_TELA));
  for (const t of excedentes) limparTemporizador(t.id);

  toasts = [...toasts, novo].slice(-MAXIMO_NA_TELA);
  avisar();

  if (typeof window !== "undefined") {
    temporizadores.set(id, window.setTimeout(() => fecharToast(id), duracaoMs));
  }
  return id;
}

export const toast = {
  sucesso: (titulo: string, opcoes?: OpcoesToast) => adicionar("sucesso", titulo, opcoes),
  erro: (titulo: string, opcoes?: OpcoesToast) => adicionar("erro", titulo, opcoes),
  info: (titulo: string, opcoes?: OpcoesToast) => adicionar("info", titulo, opcoes),
};

const ICONE: Record<TomToast, typeof CheckCircle2> = {
  sucesso: CheckCircle2,
  erro: AlertCircle,
  info: Info,
};

const ESTILO: Record<TomToast, { borda: string; selo: string; barra: string }> = {
  sucesso: {
    borda: "border-brand-300",
    selo: "bg-brand-50 text-brand-700",
    barra: "bg-brand-500",
  },
  erro: {
    borda: "border-red-300 dark:border-red-900",
    selo: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
    barra: "bg-red-500",
  },
  info: {
    borda: "border-gold-300",
    selo: "bg-gold-50 text-gold-700",
    barra: "bg-gold-400",
  },
};

/** Montado uma vez no layout raiz — vale para o site inteiro. */
export function Toaster() {
  const lista = useSyncExternalStore(inscrever, obterToasts, obterToastsNoServidor);

  if (lista.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-96"
    >
      {lista.map((t) => {
        const Icone = ICONE[t.tom];
        const estilo = ESTILO[t.tom];

        return (
          <div
            key={t.id}
            role={t.tom === "erro" ? "alert" : "status"}
            className={cn(
              "animate-toast-in pointer-events-auto overflow-hidden rounded-2xl border bg-surface shadow-soft-lg",
              estilo.borda
            )}
          >
            <div className="flex items-start gap-3 p-3.5">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", estilo.selo)}>
                <Icone className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium leading-snug text-ink-900">{t.titulo}</p>
                {t.descricao && <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{t.descricao}</p>}
              </div>

              <button
                onClick={() => fecharToast(t.id)}
                aria-label="Fechar aviso"
                className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-0.5 bg-ink-100">
              <div
                className={cn("animate-toast-timer h-full", estilo.barra)}
                style={{ animationDuration: `${t.duracaoMs}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
