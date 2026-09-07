"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Pause, Play, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Card, CardForm } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { PainelTimer, formatarDuracao, useTimerEstudo } from "@/components/cronograma-timer";
import { usePreferenciasEstudo } from "@/lib/preferencias-estudo";

type Concurso = { id: string; nome: string };
type Item = {
  id: string;
  titulo: string;
  dia_semana: number | null;
  duracao_minutos: number;
  concluido: boolean;
  concurso_id: string | null;
};

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function formatarMinutos(minutos: number) {
  if (minutos === 0) return "0min";
  return minutos < 60 ? `${minutos}min` : `${(minutos / 60).toFixed(1).replace(".0", "")}h`;
}

export function Cronograma({
  concursos,
  nomesConcurso,
  itensIniciais,
}: {
  /** Só os concursos que a pessoa escolheu seguir — não o catálogo inteiro. */
  concursos: Concurso[];
  /** Inclui também concursos de itens antigos que a pessoa deixou de seguir. */
  nomesConcurso: Record<string, string>;
  itensIniciais: Item[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const hojeIdx = new Date().getDay();

  const [titulo, setTitulo] = useState("");
  const [diaSemana, setDiaSemana] = useState(hojeIdx);
  const [duracao, setDuracao] = useState(60);
  const [concursoId, setConcursoId] = useState("");
  const [salvando, setSalvando] = useState(false);

  const preferencias = usePreferenciasEstudo();
  const timer = useTimerEstudo();
  const itemAtivo = itens.find((i) => i.id === timer.itemAtivoId) ?? null;

  // O item pode ter sido apagado em outra sessão enquanto o cronômetro contava.
  useEffect(() => {
    if (timer.itemAtivoId && !itemAtivo) timer.parar();
  }, [itemAtivo, timer]);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSalvando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSalvando(false);
      return;
    }

    const { data, error } = await supabase
      .from("cronograma_itens")
      .insert({
        user_id: user.id,
        titulo: titulo.trim(),
        dia_semana: diaSemana,
        duracao_minutos: duracao,
        concurso_id: concursoId || null,
      })
      .select("id, titulo, dia_semana, duracao_minutos, concluido, concurso_id")
      .single();

    if (error || !data) {
      toast.erro("Não foi possível salvar o item", { descricao: "Verifique sua conexão e tente de novo." });
    } else {
      setItens((prev) => [...prev, data]);
      setTitulo("");
    }
    setSalvando(false);
  }

  async function definirConcluido(item: Item, concluido: boolean) {
    if (item.concluido === concluido) return;
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, concluido } : i)));
    await supabase.from("cronograma_itens").update({ concluido }).eq("id", item.id);
  }

  async function remover(id: string) {
    if (timer.itemAtivoId === id) timer.parar();
    setItens((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("cronograma_itens").delete().eq("id", id);
  }

  function pararEstudo() {
    if (itemAtivo && preferencias.concluirAoParar) void definirConcluido(itemAtivo, true);
    timer.parar();
  }

  const totalMinutosSemana = itens.reduce((acc, i) => acc + i.duracao_minutos, 0);
  const concluidosSemana = itens.filter((i) => i.concluido).length;

  // A semana começa no dia de hoje: o que importa agora fica no topo da lista.
  const ordemDias = Array.from({ length: 7 }, (_, k) => (hojeIdx + k) % 7);

  return (
    <div>
      <CardForm onSubmit={adicionar} className="mb-6 grid gap-3 p-5 sm:grid-cols-5">
        <Input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Revisar crase"
          className="sm:col-span-2"
        />
        <Select value={diaSemana} onChange={(e) => setDiaSemana(Number(e.target.value))}>
          {DIAS.map((d, i) => (
            <option key={d} value={i}>
              {d}
              {i === hojeIdx ? " (hoje)" : ""}
            </option>
          ))}
        </Select>
        <div className="relative">
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            type="number"
            min={15}
            step={15}
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            className="pl-9"
            placeholder="Minutos"
          />
        </div>
        <Select value={concursoId} onChange={(e) => setConcursoId(e.target.value)} disabled={concursos.length === 0}>
          <option value="">{concursos.length === 0 ? "Nenhum concurso seguido" : "Sem concurso"}</option>
          {concursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={salvando} className="gap-1.5 sm:col-span-5">
          <Plus className="h-4 w-4" /> Adicionar ao cronograma
        </Button>
        {concursos.length === 0 && (
          <p className="text-xs text-ink-500 sm:col-span-5">
            Você ainda não segue nenhum concurso.{" "}
            <Link href="/dashboard/concursos" className="font-medium text-brand-700 underline underline-offset-2">
              Escolher um concurso
            </Link>{" "}
            para vincular aos estudos.
          </p>
        )}
      </CardForm>

      {itemAtivo && (
        <PainelTimer
          titulo={itemAtivo.titulo}
          subtitulo={itemAtivo.concurso_id ? nomesConcurso[itemAtivo.concurso_id] : null}
          decorridoMs={timer.decorridoMs}
          metaMs={timer.metaMs}
          rodando={timer.rodando}
          atingiuMeta={timer.atingiuMeta}
          onAlternarPausa={timer.alternarPausa}
          onZerar={timer.zerar}
          onParar={pararEstudo}
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-500">
        <p>
          Total planejado na semana:{" "}
          <span className="font-semibold text-ink-800">{formatarMinutos(totalMinutosSemana)}</span>
        </p>
        {itens.length > 0 && (
          <p>
            Concluído:{" "}
            <span className="font-semibold text-brand-700">
              {concluidosSemana}/{itens.length}
            </span>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordemDias.map((idx, posicao) => {
          const doDia = itens.filter((i) => i.dia_semana === idx);
          const minutosDoDia = doDia.reduce((acc, i) => acc + i.duracao_minutos, 0);
          const ehHoje = posicao === 0;
          const rotulo = posicao === 0 ? "Hoje" : posicao === 1 ? "Amanhã" : DIAS[idx];

          return (
            <Card
              key={idx}
              className={cn("flex flex-col p-4", ehHoje ? "border-brand-300 ring-1 ring-brand-200" : "")}
            >
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h3 className={cn("text-sm font-semibold", ehHoje ? "text-brand-700" : "text-ink-900")}>
                  {rotulo}
                  {posicao <= 1 && <span className="ml-1.5 text-xs font-normal text-ink-400">{DIAS[idx]}</span>}
                </h3>
                {minutosDoDia > 0 && <span className="shrink-0 text-xs text-ink-500">{formatarMinutos(minutosDoDia)}</span>}
              </div>

              {doDia.length === 0 && <p className="text-xs text-ink-400">Nada planejado</p>}

              <ul className="flex flex-1 flex-col gap-2">
                {doDia.map((item) => {
                  const ativo = timer.itemAtivoId === item.id;
                  const nomeConcurso = item.concurso_id ? nomesConcurso[item.concurso_id] : null;

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 transition-colors",
                        ativo ? "border-brand-400 bg-brand-50" : "border-transparent bg-ink-50"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={item.concluido}
                          onChange={(e) => definirConcluido(item, e.target.checked)}
                          aria-label={`Concluir ${item.titulo}`}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                        />

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-medium leading-snug",
                              item.concluido ? "text-ink-400 line-through" : "text-ink-800"
                            )}
                          >
                            {item.titulo}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.duracao_minutos}min
                            </span>
                            {ativo && (
                              <span
                                className={cn(
                                  "font-semibold tabular-nums",
                                  timer.atingiuMeta ? "text-gold-700" : "text-brand-700"
                                )}
                              >
                                {formatarDuracao(timer.decorridoMs)}
                              </span>
                            )}
                            {nomeConcurso && (
                              <Badge tone="brand" className="max-w-full truncate">
                                {nomeConcurso}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            onClick={() =>
                              ativo && timer.rodando
                                ? timer.alternarPausa()
                                : timer.iniciar({
                                    id: item.id,
                                    titulo: item.titulo,
                                    subtitulo: nomeConcurso,
                                    duracaoMinutos: item.duracao_minutos,
                                  })
                            }
                            aria-label={ativo && timer.rodando ? "Pausar cronômetro" : "Iniciar cronômetro"}
                            title={ativo && timer.rodando ? "Pausar" : "Começar a estudar agora"}
                            className={cn(
                              "rounded-lg p-1.5 transition-colors",
                              ativo ? "text-brand-700 hover:bg-brand-100" : "text-ink-400 hover:bg-ink-100 hover:text-brand-700"
                            )}
                          >
                            {ativo && timer.rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => remover(item.id)}
                            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                            aria-label={`Remover ${item.titulo}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
