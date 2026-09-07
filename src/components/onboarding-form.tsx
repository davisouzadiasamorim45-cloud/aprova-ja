"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Input, Label, Select } from "@/components/ui/field";
import { ESTADOS, nomeEstado } from "@/lib/estados";
import { cn } from "@/lib/cn";
import { gerarCronogramaSemanal, NOMES_DIA_SEMANA, type ItemCronogramaGerado } from "@/lib/cronograma-gerador";

type Concurso = { id: string; nome: string; orgao: string | null; nivel: string | null; estado?: string | null };
type Materia = { id: string; nome: string };

const NOVO = "__novo__";
const AINDA_NAO_SEI = "__nao_sei__";
const NENHUMA_DIFICULDADE_ESPECIFICA = "";
const DIAS_UTEIS_PADRAO = [1, 2, 3, 4, 5];

type Step = "concurso" | "perfil" | "revisao";

export function OnboardingForm({ concursos, estadoUsuario }: { concursos: Concurso[]; estadoUsuario: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [step, setStep] = useState<Step>("concurso");

  const [somenteMeuEstado, setSomenteMeuEstado] = useState(Boolean(estadoUsuario));
  const concursosFiltrados = useMemo(
    () =>
      somenteMeuEstado && estadoUsuario
        ? concursos.filter((c) => !c.estado || c.estado === estadoUsuario)
        : concursos,
    [concursos, somenteMeuEstado, estadoUsuario]
  );

  const [concursoId, setConcursoId] = useState<string>(concursosFiltrados[0]?.id ?? NOVO);
  const [novoNome, setNovoNome] = useState("");
  const [novoEstado, setNovoEstado] = useState(estadoUsuario ?? "");
  const [nivel, setNivel] = useState<"fundamental" | "medio" | "superior">("superior");

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregandoMaterias, setCarregandoMaterias] = useState(false);

  const [materiaDificilId, setMateriaDificilId] = useState<string>(NENHUMA_DIFICULDADE_ESPECIFICA);
  const [diasSemana, setDiasSemana] = useState<Set<number>>(new Set(DIAS_UTEIS_PADRAO));
  const [horasPorDia, setHorasPorDia] = useState(2);
  const [dataProva, setDataProva] = useState("");

  const [enviando, setEnviando] = useState(false);

  const itensGerados = useMemo<ItemCronogramaGerado[]>(
    () =>
      gerarCronogramaSemanal({
        materias,
        diasSemana: Array.from(diasSemana),
        materiaDificilId: materiaDificilId || null,
        horasPorDia,
      }),
    [materias, diasSemana, materiaDificilId, horasPorDia]
  );

  function alternarDia(dia: number) {
    setDiasSemana((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(dia)) proximo.delete(dia);
      else proximo.add(dia);
      return proximo;
    });
  }

  // Concurso "ainda não decidi" — não cria meta nem cronograma, vai direto pro painel.
  function pularParaODashboard() {
    router.push("/dashboard");
  }

  // Concurso novo (fora do catálogo): ainda não tem matérias cadastradas, então
  // não dá pra montar um cronograma sugerido — cria o concurso e a meta e manda
  // a pessoa montar o cronograma dela mesma.
  async function criarConcursoNovoEContinuar(e: React.FormEvent) {
    e.preventDefault();

    if (!novoNome.trim()) {
      toast.info("Falta o nome do concurso", { descricao: "Digite qual concurso você pretende fazer." });
      return;
    }
    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("concursos")
      .insert({ nome: novoNome.trim(), nivel, estado: novoEstado || null, status: "previsto", created_by: user.id })
      .select("id")
      .single();

    if (error || !data) {
      toast.erro("Não foi possível cadastrar o concurso", { descricao: "Tente novamente em instantes." });
      setEnviando(false);
      return;
    }

    await supabase.from("metas_concurso").upsert(
      { user_id: user.id, concurso_id: data.id, data_prova: dataProva || null, horas_semanais_meta: horasPorDia * 7 },
      { onConflict: "user_id,concurso_id" }
    );

    router.push("/dashboard/cronograma");
  }

  // Concurso do catálogo — busca as matérias já cadastradas pra alimentar a
  // pergunta de "maior dificuldade" e a sugestão de cronograma.
  async function irParaPerfil() {
    setCarregandoMaterias(true);
    const { data } = await supabase.from("materias").select("id, nome").eq("concurso_id", concursoId).order("ordem");
    setMaterias(data ?? []);
    setCarregandoMaterias(false);
    setStep("perfil");
  }

  async function finalizar(usarCronogramaGerado: boolean) {
    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("metas_concurso").upsert(
      {
        user_id: user.id,
        concurso_id: concursoId,
        data_prova: dataProva || null,
        horas_semanais_meta: horasPorDia * Math.max(1, diasSemana.size),
      },
      { onConflict: "user_id,concurso_id" }
    );

    if (usarCronogramaGerado && itensGerados.length > 0) {
      await supabase.from("cronograma_itens").insert(
        itensGerados.map((item) => ({
          user_id: user.id,
          concurso_id: concursoId,
          materia_id: item.materia_id,
          titulo: `Estudar ${item.materia_nome}`,
          dia_semana: item.dia_semana,
          duracao_minutos: item.duracao_minutos,
        }))
      );
      router.push("/dashboard");
    } else {
      router.push("/dashboard/cronograma");
    }
  }

  // --- Passo 1: qual concurso ------------------------------------------------
  if (step === "concurso") {
    return (
      <form
        onSubmit={concursoId === NOVO ? criarConcursoNovoEContinuar : (e) => e.preventDefault()}
        className="flex flex-col gap-5"
      >
        <div>
          <div className="flex items-center justify-between">
            <Label>Qual concurso você pretende fazer?</Label>
            {estadoUsuario && (
              <button
                type="button"
                onClick={() => {
                  setSomenteMeuEstado((v) => !v);
                  setConcursoId(NOVO);
                }}
                className="text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
              >
                {somenteMeuEstado ? "Ver concursos de todos os estados" : `Ver só ${nomeEstado(estadoUsuario)} + Nacionais`}
              </button>
            )}
          </div>
          <Select value={concursoId} onChange={(e) => setConcursoId(e.target.value)}>
            {concursosFiltrados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.orgao ? `· ${c.orgao}` : ""} · {c.estado ? c.estado : "Nacional"}
              </option>
            ))}
            <option value={NOVO}>Outro concurso (vou digitar)</option>
            <option value={AINDA_NAO_SEI}>Ainda não decidi</option>
          </Select>
        </div>

        {concursoId === NOVO && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nome do concurso</Label>
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Tribunal Regional do Trabalho - Técnico"
              />
            </div>
            <div>
              <Label>Nível</Label>
              <Select value={nivel} onChange={(e) => setNivel(e.target.value as "fundamental" | "medio" | "superior")}>
                <option value="fundamental">Fundamental</option>
                <option value="medio">Médio</option>
                <option value="superior">Superior</option>
              </Select>
            </div>
            <div>
              <Label>Estado (deixe em branco se for nacional)</Label>
              <Select value={novoEstado} onChange={(e) => setNovoEstado(e.target.value)}>
                <option value="">Nacional</option>
                {ESTADOS.map((e) => (
                  <option key={e.uf} value={e.uf}>
                    {e.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Horas de estudo por dia</Label>
              <Input type="number" min={0.5} step={0.5} value={horasPorDia} onChange={(e) => setHorasPorDia(Number(e.target.value))} />
            </div>
            <div>
              <Label>Data da prova (se souber)</Label>
              <Input type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
            </div>
          </div>
        )}

        {concursoId === AINDA_NAO_SEI ? (
          <Button type="button" onClick={pularParaODashboard}>
            Ir para o painel
          </Button>
        ) : concursoId === NOVO ? (
          <Button type="submit" disabled={enviando}>
            {enviando ? "Preparando seu painel..." : "Continuar"}
          </Button>
        ) : (
          <Button type="button" onClick={irParaPerfil} disabled={carregandoMaterias}>
            {carregandoMaterias ? "Carregando..." : "Continuar"}
          </Button>
        )}
      </form>
    );
  }

  // --- Passo 2: perfil de estudo ----------------------------------------------
  if (step === "perfil") {
    return (
      <div className="flex flex-col gap-5">
        {materias.length > 0 ? (
          <div>
            <Label>Qual matéria é sua maior dificuldade?</Label>
            <Select value={materiaDificilId} onChange={(e) => setMateriaDificilId(e.target.value)}>
              <option value={NENHUMA_DIFICULDADE_ESPECIFICA}>Nenhuma em especial</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-ink-400">Vamos reforçar essa matéria com mais frequência no seu cronograma.</p>
          </div>
        ) : (
          <p className="flex items-start gap-2 rounded-xl bg-ink-50 px-3.5 py-2.5 text-sm text-ink-500">
            <ListChecks className="mt-0.5 h-4 w-4 shrink-0" />
            Esse concurso ainda não tem as matérias do edital cadastradas no nosso catálogo, então não dá pra sugerir um cronograma por
            matéria ainda — mas você pode continuar e montar o seu manualmente.
          </p>
        )}

        <div>
          <Label>Em quais dias você consegue estudar?</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {NOMES_DIA_SEMANA.map((nome, dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => alternarDia(dia)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  diasSemana.has(dia)
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 text-ink-500 hover:border-brand-300"
                )}
              >
                {nome.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Horas de estudo por dia</Label>
            <Input type="number" min={0.5} step={0.5} value={horasPorDia} onChange={(e) => setHorasPorDia(Number(e.target.value))} />
          </div>
          <div>
            <Label>Data da prova (se souber)</Label>
            <Input type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep("concurso")}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <Button type="button" onClick={() => setStep("revisao")} disabled={diasSemana.size === 0} className="flex-1">
            {materias.length > 0 ? "Ver cronograma sugerido" : "Continuar"}
          </Button>
        </div>
        {diasSemana.size === 0 && <p className="text-xs text-red-600">Selecione ao menos um dia da semana.</p>}
      </div>
    );
  }

  // --- Passo 3: revisão do cronograma -----------------------------------------
  return (
    <div className="flex flex-col gap-5">
      {itensGerados.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center gap-2 text-ink-700">
            <CalendarClock className="h-4.5 w-4.5 text-brand-600" strokeWidth={1.9} />
            <p className="text-sm font-semibold">Seu cronograma sugerido</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {itensGerados.map((item) => (
              <li
                key={item.dia_semana}
                className="flex items-center justify-between rounded-lg bg-ink-50 px-3.5 py-2.5 text-sm"
              >
                <span className="font-medium text-ink-700">{NOMES_DIA_SEMANA[item.dia_semana]}</span>
                <span className="text-ink-600">{item.materia_nome}</span>
                <span className="text-xs text-ink-400">{Math.round(item.duracao_minutos / 60)}h</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-400">
            Dá pra editar tudo isso depois em Cronograma — dias, matérias e duração.
          </p>
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-xl bg-ink-50 px-3.5 py-2.5 text-sm text-ink-500">
          <ListChecks className="mt-0.5 h-4 w-4 shrink-0" />
          Sem matérias cadastradas pra esse concurso ainda, não temos o que sugerir — mas sua meta de estudo já fica salva e você monta o
          cronograma do seu jeito na próxima tela.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setStep("perfil")}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        {itensGerados.length > 0 ? (
          <>
            <button
              type="button"
              disabled={enviando}
              onClick={() => finalizar(false)}
              className="flex-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
            >
              Prefiro montar o meu
            </button>
            <Button type="button" disabled={enviando} onClick={() => finalizar(true)} className="flex-1">
              {enviando ? "Preparando..." : "Usar esse cronograma"}
            </Button>
          </>
        ) : (
          <Button type="button" disabled={enviando} onClick={() => finalizar(false)} className="flex-1">
            {enviando ? "Preparando..." : "Ir montar meu cronograma"}
          </Button>
        )}
      </div>
    </div>
  );
}
