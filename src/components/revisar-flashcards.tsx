"use client";

import { useMemo, useState } from "react";
import { PartyPopper, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calcularProximaRevisao } from "@/lib/spaced-repetition/sm2";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

type Flashcard = {
  id: string;
  frente: string;
  verso: string;
  intervalo_dias: number;
  fator_facilidade: number;
  repeticoes: number;
};

const OPCOES = [
  { qualidade: 1, label: "Errei", classe: "bg-red-50 text-red-700 hover:bg-red-100" },
  { qualidade: 3, label: "Difícil", classe: "bg-gold-100 text-gold-800 hover:bg-gold-200" },
  { qualidade: 4, label: "Bom", classe: "bg-brand-100 text-brand-800 hover:bg-brand-200" },
  { qualidade: 5, label: "Fácil", classe: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" },
];

export function RevisarFlashcards({ cardsIniciais }: { cardsIniciais: Flashcard[] }) {
  const supabase = useMemo(() => createClient(), []);
  const fila = cardsIniciais;
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [revisados, setRevisados] = useState(0);

  const cardAtual = fila[indice];

  async function avaliar(qualidade: number) {
    if (!cardAtual) return;

    const resultado = calcularProximaRevisao(
      {
        intervalo_dias: cardAtual.intervalo_dias,
        fator_facilidade: cardAtual.fator_facilidade,
        repeticoes: cardAtual.repeticoes,
      },
      qualidade
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await Promise.all([
      supabase.from("flashcards").update(resultado).eq("id", cardAtual.id),
      user
        ? supabase.from("flashcard_revisoes").insert({ flashcard_id: cardAtual.id, user_id: user.id, qualidade })
        : Promise.resolve(),
    ]);

    setRevisados((r) => r + 1);
    setVirado(false);
    setIndice((i) => i + 1);
  }

  if (fila.length === 0) {
    return (
      <Card className="p-10 text-center">
        <PartyPopper className="mx-auto h-8 w-8 text-gold-500" strokeWidth={1.75} />
        <p className="mt-3 text-ink-600">Nenhum cartão pendente para revisão hoje.</p>
      </Card>
    );
  }

  if (indice >= fila.length) {
    return (
      <Card className="p-10 text-center">
        <PartyPopper className="mx-auto h-8 w-8 text-gold-500" strokeWidth={1.75} />
        <p className="mt-3 font-display text-lg font-semibold text-ink-900">Revisão concluída!</p>
        <p className="mt-2 text-ink-600">Você revisou {revisados} cartão(ões) hoje.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-ink-500">
          {indice + 1} de {fila.length}
        </p>
        <p className="text-xs text-ink-400">{revisados} revisados</p>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${(indice / fila.length) * 100}%` }} />
      </div>

      <button
        onClick={() => setVirado((v) => !v)}
        className={cn(
          "flex min-h-[240px] w-full flex-col items-center justify-center rounded-2xl border p-8 text-center transition-all duration-200",
          "shadow-soft hover:shadow-soft-lg",
          virado ? "border-brand-300 bg-brand-50/50" : "border-ink-200 bg-white"
        )}
      >
        {!virado && <span className="mb-3 text-[11px] font-medium uppercase tracking-wide text-ink-400">Pergunta</span>}
        <p className="font-display text-xl text-ink-900">{virado ? cardAtual.verso : cardAtual.frente}</p>
        {!virado && <p className="mt-5 text-xs text-ink-400">Toque para virar o cartão</p>}
      </button>

      {virado ? (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {OPCOES.map((op) => (
            <button
              key={op.qualidade}
              onClick={() => avaliar(op.qualidade)}
              className={cn("rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors", op.classe)}
            >
              {op.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-sm text-ink-400">
          <RotateCcw className="h-3.5 w-3.5" /> Lembre-se da resposta antes de virar
        </p>
      )}
    </div>
  );
}
