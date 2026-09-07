"use client";

import { useMemo, useState } from "react";
import { Check, PartyPopper, RotateCcw, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

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

const DIFICULDADE_TONE = {
  facil: "success",
  media: "gold",
  dificil: "danger",
} as const;

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
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Concurso</Label>
            <Select value={concursoId} onChange={(e) => selecionarConcurso(e.target.value)}>
              <option value="">Todos</option>
              {concursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Matéria</Label>
            <Select value={materiaId} onChange={(e) => setMateriaId(e.target.value)} disabled={!concursoId}>
              <option value="">Todas</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Dificuldade</Label>
            <Select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)}>
              <option value="">Todas</option>
              <option value="facil">Fácil</option>
              <option value="media">Média</option>
              <option value="dificil">Difícil</option>
            </Select>
          </div>
        </div>

        <Button onClick={iniciarSessao} disabled={carregando} className="mt-6">
          {carregando ? "Carregando..." : "Começar a praticar"}
        </Button>
      </Card>
    );
  }

  if (carregando) {
    return (
      <Card className="flex items-center gap-3 p-6">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
        <p className="text-sm text-ink-500">Carregando questões...</p>
      </Card>
    );
  }

  if (questoes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ink-600">Nenhuma questão encontrada para esses filtros.</p>
        <button onClick={() => setIniciou(false)} className="mt-3 text-sm font-medium text-brand-700 hover:underline">
          Ajustar filtros
        </button>
      </Card>
    );
  }

  if (indice >= questoes.length) {
    const taxa = sessao.total > 0 ? Math.round((sessao.acertos / sessao.total) * 100) : 0;
    return (
      <Card className="p-8 text-center">
        <PartyPopper className="mx-auto h-8 w-8 text-gold-500" strokeWidth={1.75} />
        <p className="mt-3 font-display text-lg font-semibold text-ink-900">Sessão concluída!</p>
        <p className="mt-2 text-ink-600">
          Você acertou {sessao.acertos} de {sessao.total} questões ({taxa}%).
        </p>
        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${taxa}%` }} />
        </div>
        <Button onClick={() => setIniciou(false)} className="mt-6 gap-2">
          <RotateCcw className="h-4 w-4" /> Praticar novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-ink-500">
        <span className="font-medium">
          Questão {indice + 1} de {questoes.length}
        </span>
        <span>
          Acertos: <span className="font-semibold text-ink-700">{sessao.acertos}/{sessao.total}</span>
        </span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${(indice / questoes.length) * 100}%` }}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {questaoAtual.banca && <Badge>{questaoAtual.banca}</Badge>}
        {questaoAtual.ano && <Badge>{questaoAtual.ano}</Badge>}
        <Badge tone={DIFICULDADE_TONE[questaoAtual.dificuldade]} className="capitalize">
          {questaoAtual.dificuldade}
        </Badge>
      </div>

      <p className="text-base leading-relaxed text-ink-900">{questaoAtual.enunciado}</p>

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
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  showCorrect
                    ? "border-brand-500 bg-brand-50"
                    : showWrong
                      ? "border-red-400 bg-red-50 dark:bg-red-950"
                      : isSelected
                        ? "border-brand-400 bg-brand-50"
                        : "border-ink-200 hover:border-brand-300 hover:bg-ink-50",
                  respondida ? "cursor-default" : "cursor-pointer"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    showCorrect
                      ? "bg-brand-600 text-white"
                      : showWrong
                        ? "bg-red-500 text-white"
                        : "bg-ink-100 text-ink-500"
                  )}
                >
                  {showCorrect ? <Check className="h-3.5 w-3.5" /> : showWrong ? <X className="h-3.5 w-3.5" /> : alt.letra}
                </span>
                <span className="text-ink-800">{alt.texto}</span>
              </button>
            );
          })}
      </div>

      {respondida && (
        <div className="mt-5 rounded-xl bg-ink-50 p-4 text-sm text-ink-700">
          {questaoAtual.explicacao && (
            <p>
              <span className="font-semibold">Comentário: </span>
              {questaoAtual.explicacao}
            </p>
          )}
          <Button onClick={proxima} size="sm" className="mt-3">
            Próxima questão →
          </Button>
        </div>
      )}
    </Card>
  );
}
