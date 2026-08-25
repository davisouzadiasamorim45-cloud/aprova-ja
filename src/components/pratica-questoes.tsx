"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Concurso = { id: string; nome: string };
type Materia = { id: string; nome: string };
type Alternativa = { id: string; letra: string; texto: string; correta: boolean; ordem: number };
type Questao = {
  id: string;
  enunciado: string;
  tipo: "multipla_escolha" | "certo_errado";
  dificuldade: "facil" | "media" | "dificil";
  banca: string | null;
  ano: number | null;
  explicacao: string | null;
  alternativas: Alternativa[];
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PraticaQuestoes({ concursos }: { concursos: Concurso[] }) {
  const supabase = useMemo(() => createClient(), []);

  const [concursoId, setConcursoId] = useState<string>("");
  const [materiaId, setMateriaId] = useState<string>("");
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [dificuldade, setDificuldade] = useState<string>("");

  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indice, setIndice] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [sessao, setSessao] = useState({ acertos: 0, total: 0 });
  const [iniciou, setIniciou] = useState(false);

  async function selecionarConcurso(novoConcursoId: string) {
    setConcursoId(novoConcursoId);
    setMateriaId("");

    if (!novoConcursoId) {
      setMaterias([]);
      return;
    }

    const { data } = await supabase.from("materias").select("id, nome").eq("concurso_id", novoConcursoId).order("ordem");
    setMaterias(data ?? []);
  }

  async function iniciarSessao() {
    setCarregando(true);
    setIniciou(true);
    setSessao({ acertos: 0, total: 0 });
    setIndice(0);

    let query = supabase
      .from("questoes")
      .select("id, enunciado, tipo, dificuldade, banca, ano, explicacao, alternativas(id, letra, texto, correta, ordem)")
      .limit(30);

    if (concursoId) query = query.eq("concurso_id", concursoId);
    if (materiaId) query = query.eq("materia_id", materiaId);
    if (dificuldade) query = query.eq("dificuldade", dificuldade as "facil" | "media" | "dificil");

    const { data, error } = await query;

    if (!error && data) {
      const embaralhadas = shuffle(data as unknown as Questao[]).map((q) => ({
        ...q,
        alternativas: shuffle(q.alternativas),
      }));
      setQuestoes(embaralhadas);
    } else {
      setQuestoes([]);
    }
    setCarregando(false);
  }

  const questaoAtual = questoes[indice];

  async function responder(alternativa: Alternativa) {
    if (respondida) return;
    setSelecionada(alternativa.id);
    setRespondida(true);

    setSessao((s) => ({ acertos: s.acertos + (alternativa.correta ? 1 : 0), total: s.total + 1 }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && questaoAtual) {
      await supabase.from("tentativas").insert({
        user_id: user.id,
        questao_id: questaoAtual.id,
        alternativa_id: alternativa.id,
        correta: alternativa.correta,
      });
    }
  }

  function proxima() {
    setSelecionada(null);
    setRespondida(false);
    setIndice((i) => i + 1);
  }

  if (!iniciou) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Concurso</label>
            <select
              value={concursoId}
              onChange={(e) => selecionarConcurso(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {concursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Matéria</label>
            <select
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value)}
              disabled={!concursoId}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            >
              <option value="">Todas</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Dificuldade</label>
            <select
              value={dificuldade}
              onChange={(e) => setDificuldade(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              <option value="facil">Fácil</option>
              <option value="media">Média</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
        </div>

        <button
          onClick={iniciarSessao}
          disabled={carregando}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {carregando ? "Carregando..." : "Começar a praticar"}
        </button>
      </div>
    );
  }

  if (carregando) {
    return <p className="text-sm text-slate-500">Carregando questões...</p>;
  }

  if (questoes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-600">Nenhuma questão encontrada para esses filtros.</p>
        <button onClick={() => setIniciou(false)} className="mt-3 text-sm font-medium text-indigo-600 hover:underline">
          Ajustar filtros
        </button>
      </div>
    );
  }

  if (indice >= questoes.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">Sessão concluída! 🎉</p>
        <p className="mt-2 text-slate-600">
          Você acertou {sessao.acertos} de {sessao.total} questões (
          {sessao.total > 0 ? Math.round((sessao.acertos / sessao.total) * 100) : 0}%).
        </p>
        <button
          onClick={() => setIniciou(false)}
          className="mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Praticar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Questão {indice + 1} de {questoes.length}
        </span>
        <span>
          Acertos: {sessao.acertos}/{sessao.total}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {questaoAtual.banca && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{questaoAtual.banca}</span>
        )}
        {questaoAtual.ano && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{questaoAtual.ano}</span>}
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 capitalize">{questaoAtual.dificuldade}</span>
      </div>

      <p className="text-base leading-relaxed text-slate-900">{questaoAtual.enunciado}</p>

      <div className="mt-5 flex flex-col gap-2">
        {questaoAtual.alternativas
          .sort((a, b) => a.ordem - b.ordem)
          .map((alt) => {
            const isSelected = selecionada === alt.id;
            const showCorrect = respondida && alt.correta;
            const showWrong = respondida && isSelected && !alt.correta;

            return (
              <button
                key={alt.id}
                onClick={() => responder(alt)}
                disabled={respondida}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                  showCorrect
                    ? "border-emerald-500 bg-emerald-50"
                    : showWrong
                    ? "border-red-500 bg-red-50"
                    : isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                } ${respondida ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className="font-semibold text-slate-500">{alt.letra}</span>
                <span className="text-slate-800">{alt.texto}</span>
              </button>
            );
          })}
      </div>

      {respondida && (
        <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          {questaoAtual.explicacao && (
            <p>
              <span className="font-semibold">Comentário: </span>
              {questaoAtual.explicacao}
            </p>
          )}
          <button
            onClick={proxima}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Próxima questão →
          </button>
        </div>
      )}
    </div>
  );
}
