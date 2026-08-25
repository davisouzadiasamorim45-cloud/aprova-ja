"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Baralho = { id: string; nome: string; concurso_id: string | null };
type Flashcard = { id: string; frente: string; verso: string; proxima_revisao: string };

export function Baralhos({ baralhosIniciais }: { baralhosIniciais: Baralho[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [baralhos, setBaralhos] = useState<Baralho[]>(baralhosIniciais);
  const [novoBaralho, setNovoBaralho] = useState("");
  const [baralhoAtivo, setBaralhoAtivo] = useState<string | null>(baralhosIniciais[0]?.id ?? null);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [carregandoCards, setCarregandoCards] = useState(false);
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");

  async function carregarCards(baralhoId: string) {
    setBaralhoAtivo(baralhoId);
    setCarregandoCards(true);
    const { data } = await supabase
      .from("flashcards")
      .select("id, frente, verso, proxima_revisao")
      .eq("baralho_id", baralhoId)
      .order("created_at", { ascending: false });
    setCards(data ?? []);
    setCarregandoCards(false);
  }

  async function criarBaralho(e: React.FormEvent) {
    e.preventDefault();
    if (!novoBaralho.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("baralhos")
      .insert({ user_id: user.id, nome: novoBaralho.trim() })
      .select("id, nome, concurso_id")
      .single();

    if (!error && data) {
      setBaralhos((prev) => [...prev, data]);
      setNovoBaralho("");
      carregarCards(data.id);
    }
  }

  async function adicionarCard(e: React.FormEvent) {
    e.preventDefault();
    if (!baralhoAtivo || !frente.trim() || !verso.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("flashcards")
      .insert({ baralho_id: baralhoAtivo, user_id: user.id, frente: frente.trim(), verso: verso.trim() })
      .select("id, frente, verso, proxima_revisao")
      .single();

    if (!error && data) {
      setCards((prev) => [data, ...prev]);
      setFrente("");
      setVerso("");
    }
  }

  async function removerCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("flashcards").delete().eq("id", id);
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <form onSubmit={criarBaralho} className="mb-4 flex gap-2">
          <input
            value={novoBaralho}
            onChange={(e) => setNovoBaralho(e.target.value)}
            placeholder="Novo baralho"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            +
          </button>
        </form>

        <ul className="flex flex-col gap-1">
          {baralhos.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => carregarCards(b.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  baralhoAtivo === b.id ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {b.nome}
              </button>
            </li>
          ))}
          {baralhos.length === 0 && <p className="px-3 text-sm text-slate-400">Crie seu primeiro baralho</p>}
        </ul>
      </div>

      <div className="md:col-span-2">
        {!baralhoAtivo ? (
          <p className="text-sm text-slate-500">Selecione ou crie um baralho para adicionar cartões.</p>
        ) : (
          <>
            <form onSubmit={adicionarCard} className="mb-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-4">
              <textarea
                value={frente}
                onChange={(e) => setFrente(e.target.value)}
                placeholder="Frente (pergunta)"
                rows={2}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={verso}
                onChange={(e) => setVerso(e.target.value)}
                placeholder="Verso (resposta)"
                rows={2}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="justify-self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Adicionar cartão
              </button>
            </form>

            {carregandoCards ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {cards.map((c) => (
                  <li key={c.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">{c.frente}</p>
                        <p className="mt-1 text-slate-500">{c.verso}</p>
                      </div>
                      <button onClick={() => removerCard(c.id)} className="shrink-0 text-slate-400 hover:text-red-500">
                        ×
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Próxima revisão: {new Date(c.proxima_revisao + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </li>
                ))}
                {cards.length === 0 && <p className="text-sm text-slate-400">Nenhum cartão neste baralho ainda.</p>}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
