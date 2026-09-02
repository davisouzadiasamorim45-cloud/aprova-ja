"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Card, CardForm } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";

type Baralho = { id: string; nome: string; concurso_id: string | null };
type Flashcard = { id: string; frente: string; verso: string; proxima_revisao: string };

export function Baralhos({ baralhosIniciais }: { baralhosIniciais: Baralho[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [baralhos, setBaralhos] = useState<Baralho[]>(baralhosIniciais);
  const [novoBaralho, setNovoBaralho] = useState("");
  const [baralhoAtivo, setBaralhoAtivo] = useState<string | null>(baralhosIniciais[0]?.id ?? null);

  const [cards, setCards] = useState<Flashcard[]>([]);
  // Já nasce "carregando" quando existe um baralho padrão selecionado, para o
  // efeito abaixo não precisar chamar setState de forma síncrona.
  const [carregandoCards, setCarregandoCards] = useState(() => Boolean(baralhosIniciais[0]?.id));
  const [frente, setFrente] = useState("");
  const [verso, setVerso] = useState("");

  async function buscarCardsSilenciosamente(baralhoId: string) {
    const { data } = await supabase
      .from("flashcards")
      .select("id, frente, verso, proxima_revisao")
      .eq("baralho_id", baralhoId)
      .order("created_at", { ascending: false });
    setCards(data ?? []);
    setCarregandoCards(false);
  }

  function carregarCards(baralhoId: string) {
    setBaralhoAtivo(baralhoId);
    setCarregandoCards(true);
    buscarCardsSilenciosamente(baralhoId);
  }

  // Carrega os cartões do baralho já selecionado por padrão ao entrar na página
  // (sem isso, o primeiro baralho aparecia "vazio" até o usuário clicar nele).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca assíncrona (setState só ocorre após o await, dentro da promise)
    if (baralhoAtivo) buscarCardsSilenciosamente(baralhoAtivo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <CardForm onSubmit={criarBaralho} className="mb-4 flex gap-2 border-none bg-transparent p-0 shadow-none">
          <Input value={novoBaralho} onChange={(e) => setNovoBaralho(e.target.value)} placeholder="Novo baralho" className="min-w-0 flex-1" />
          <Button type="submit" size="md" className="px-3" aria-label="Criar baralho">
            <Plus className="h-4 w-4" />
          </Button>
        </CardForm>

        <ul className="flex flex-col gap-1">
          {baralhos.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => carregarCards(b.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  baralhoAtivo === b.id ? "bg-brand-50 font-medium text-brand-800" : "text-ink-600 hover:bg-ink-100"
                )}
              >
                <Layers className="h-4 w-4 shrink-0 opacity-60" />
                <span className="truncate">{b.nome}</span>
              </button>
            </li>
          ))}
          {baralhos.length === 0 && <p className="px-3 text-sm text-ink-400">Crie seu primeiro baralho</p>}
        </ul>
      </div>

      <div className="md:col-span-2">
        {!baralhoAtivo ? (
          <p className="text-sm text-ink-500">Selecione ou crie um baralho para adicionar cartões.</p>
        ) : (
          <>
            <CardForm onSubmit={adicionarCard} className="mb-4 grid gap-2 p-4">
              <Textarea value={frente} onChange={(e) => setFrente(e.target.value)} placeholder="Frente (pergunta)" rows={2} />
              <Textarea value={verso} onChange={(e) => setVerso(e.target.value)} placeholder="Verso (resposta)" rows={2} />
              <Button type="submit" size="sm" className="justify-self-start">
                Adicionar cartão
              </Button>
            </CardForm>

            {carregandoCards ? (
              <p className="text-sm text-ink-500">Carregando...</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {cards.map((c) => (
                  <Card key={c.id} className="p-3.5 text-sm shadow-none">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink-800">{c.frente}</p>
                        <p className="mt-1 text-ink-500">{c.verso}</p>
                      </div>
                      <button onClick={() => removerCard(c.id)} className="shrink-0 text-ink-400 hover:text-red-500" aria-label="Remover cartão">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-ink-400">
                      Próxima revisão: {new Date(c.proxima_revisao + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </Card>
                ))}
                {cards.length === 0 && <p className="text-sm text-ink-400">Nenhum cartão neste baralho ainda.</p>}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
