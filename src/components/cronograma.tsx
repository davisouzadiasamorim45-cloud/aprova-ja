"use client";

import { useMemo, useState } from "react";
import { Clock, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Card, CardForm } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";

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
const DIAS_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function Cronograma({ concursos, itensIniciais }: { concursos: Concurso[]; itensIniciais: Item[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [titulo, setTitulo] = useState("");
  const [diaSemana, setDiaSemana] = useState(1);
  const [duracao, setDuracao] = useState(60);
  const [concursoId, setConcursoId] = useState("");
  const [salvando, setSalvando] = useState(false);

  const hojeIdx = new Date().getDay();

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSalvando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

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

    if (!error && data) {
      setItens((prev) => [...prev, data]);
      setTitulo("");
    }
    setSalvando(false);
  }

  async function alternarConcluido(item: Item) {
    setItens((prev) => prev.map((i) => (i.id === item.id ? { ...i, concluido: !i.concluido } : i)));
    await supabase.from("cronograma_itens").update({ concluido: !item.concluido }).eq("id", item.id);
  }

  async function remover(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("cronograma_itens").delete().eq("id", id);
  }

  const totalMinutosSemana = itens.reduce((acc, i) => acc + i.duracao_minutos, 0);
  const concluidosSemana = itens.filter((i) => i.concluido).length;

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
        <Select value={concursoId} onChange={(e) => setConcursoId(e.target.value)}>
          <option value="">Sem concurso</option>
          {concursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={salvando} className="gap-1.5 sm:col-span-5">
          <Plus className="h-4 w-4" /> Adicionar ao cronograma
        </Button>
      </CardForm>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-500">
        <p>
          Total planejado na semana: <span className="font-semibold text-ink-800">{(totalMinutosSemana / 60).toFixed(1)}h</span>
        </p>
        {itens.length > 0 && (
          <p>
            Concluído: <span className="font-semibold text-brand-700">{concluidosSemana}/{itens.length}</span>
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {DIAS.map((dia, idx) => {
          const doDia = itens.filter((i) => i.dia_semana === idx);
          const ehHoje = idx === hojeIdx;
          return (
            <Card
              key={dia}
              className={cn("flex flex-col p-4", ehHoje ? "border-brand-300 ring-1 ring-brand-200" : "")}
            >
              <h3 className={cn("mb-3 text-sm font-semibold", ehHoje ? "text-brand-700" : "text-ink-900")}>
                <span className="lg:hidden">{dia}</span>
                <span className="hidden lg:inline">{DIAS_CURTO[idx]}</span>
                {ehHoje && <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">hoje</span>}
              </h3>
              {doDia.length === 0 && <p className="text-xs text-ink-400">Nada planejado</p>}
              <ul className="flex flex-1 flex-col gap-2">
                {doDia.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.concluido}
                      onChange={() => alternarConcluido(item)}
                      className="h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
                    />
                    <span className={cn("flex-1 truncate", item.concluido ? "text-ink-400 line-through" : "text-ink-700")}>
                      {item.titulo}
                    </span>
                    <span className="shrink-0 text-xs text-ink-400">{item.duracao_minutos}min</span>
                    <button onClick={() => remover(item.id)} className="shrink-0 text-ink-400 hover:text-red-500" aria-label="Remover">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
