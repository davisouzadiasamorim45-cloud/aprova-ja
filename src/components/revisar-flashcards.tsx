"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calcularProximaRevisao } from "@/lib/spaced-repetition/sm2";

type Flashcard = {
  id: string;
  frente: string;
  verso: string;
  intervalo_dias: number;
  fator_facilidade: number;
  repeticoes: number;
};

const OPCOES = [
  { qualidade: 1, label: "Errei", classe: "bg-red-100 text-red-700 hover:bg-red-200" },
  { qualidade: 3, label: "Difícil", classe: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  { qualidade: 4, label: "Bom", classe: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  { qualidade: 5, label: "Fácil", classe: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Nenhum cartão pendente para revisão hoje. 🎉</p>
      </div>
    );
  }

  if (indice >= fila.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">Revisão concluída!</p>
        <p className="mt-2 text-slate-600">Você revisou {revisados} cartão(ões) hoje.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="mb-3 text-center text-xs text-slate-400">
        {indice + 1} de {fila.length}
      </p>

      <button
        onClick={() => setVirado((v) => !v)}
        className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md"
      >
        <p className="text-lg text-slate-900">{virado ? cardAtual.verso : cardAtual.frente}</p>
        {!virado && <p className="mt-4 text-xs text-slate-400">Toque para virar</p>}
      </button>

      {virado ? (
        <div className="mt-5 grid grid-cols-4 gap-2">
          {OPCOES.map((op) => (
            <button
              key={op.qualidade}
              onClick={() => avaliar(op.qualidade)}
              className={`rounded-lg px-2 py-2.5 text-sm font-semibold transition ${op.classe}`}
            >
              {op.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-center text-sm text-slate-400">Lembre-se da resposta antes de virar o cartão</p>
      )}
    </div>
  );
}
