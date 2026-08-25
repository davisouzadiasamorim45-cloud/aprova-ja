"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

export function Cronograma({ concursos, itensIniciais }: { concursos: Concurso[]; itensIniciais: Item[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [itens, setItens] = useState<Item[]>(itensIniciais);
  const [titulo, setTitulo] = useState("");
  const [diaSemana, setDiaSemana] = useState(1);
  const [duracao, setDuracao] = useState(60);
  const [concursoId, setConcursoId] = useState("");
  const [salvando, setSalvando] = useState(false);

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

  return (
    <div>
      <form onSubmit={adicionar} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-5">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Revisar crase"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={diaSemana}
          onChange={(e) => setDiaSemana(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {DIAS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={15}
          step={15}
          value={duracao}
          onChange={(e) => setDuracao(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Minutos"
        />
        <select
          value={concursoId}
          onChange={(e) => setConcursoId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Sem concurso</option>
          {concursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-5"
        >
          Adicionar ao cronograma
        </button>
      </form>

      <p className="mb-3 text-sm text-slate-500">
        Total planejado na semana: <span className="font-semibold text-slate-700">{(totalMinutosSemana / 60).toFixed(1)}h</span>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {DIAS.map((dia, idx) => {
          const doDia = itens.filter((i) => i.dia_semana === idx);
          return (
            <div key={dia} className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">{dia}</h3>
              {doDia.length === 0 && <p className="text-xs text-slate-400">Nada planejado</p>}
              <ul className="flex flex-col gap-2">
                {doDia.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.concluido}
                      onChange={() => alternarConcluido(item)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    <span className={`flex-1 ${item.concluido ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {item.titulo}
                    </span>
                    <span className="text-xs text-slate-400">{item.duracao_minutos}min</span>
                    <button onClick={() => remover(item.id)} className="text-slate-400 hover:text-red-500" aria-label="Remover">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
