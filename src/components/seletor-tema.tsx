"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { definirTema, TEMAS, useTema } from "@/lib/tema";
import { Card } from "@/components/ui/card";

/** Amostra de cores de cada tema, fixa (não usa var(--...) do tema atual) —
 *  senão todo cartão mudaria de cor junto quando a página troca de tema. */
const AMOSTRA: Record<string, { fundo: string; superficie: string; destaque: string }> = {
  light: { fundo: "#faf8f4", superficie: "#ffffff", destaque: "#157456" },
  dark: { fundo: "#16140f", superficie: "#1e1a14", destaque: "#34a874" },
  sepia: { fundo: "#f2e8d2", superficie: "#faf3e3", destaque: "#157456" },
};

export function SeletorTema() {
  const temaAtual = useTema();

  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-ink-800">Tema</p>
      <p className="mt-0.5 text-xs text-ink-500">Escolha a aparência do painel neste aparelho.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {TEMAS.map((t) => {
          const amostra = AMOSTRA[t.id];
          const selecionado = temaAtual === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => definirTema(t.id)}
              aria-pressed={selecionado}
              className={cn(
                "rounded-2xl border p-3 text-left transition-all",
                selecionado ? "border-brand-500 ring-2 ring-brand-200" : "border-ink-200 hover:border-ink-300"
              )}
            >
              <div
                className="flex h-14 items-center justify-end gap-1 overflow-hidden rounded-lg border border-black/5 p-2"
                style={{ background: amostra.fundo }}
              >
                <div className="h-full flex-1 rounded-md" style={{ background: amostra.superficie }} />
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: amostra.destaque }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink-800">{t.nome}</span>
                {selecionado && <Check className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.5} />}
              </div>
              <p className="mt-0.5 text-xs leading-snug text-ink-500">{t.descricao}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
