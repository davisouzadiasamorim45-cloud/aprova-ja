"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Concurso = { id: string; nome: string; orgao: string | null; nivel: string | null };

const NOVO = "__novo__";
const AINDA_NAO_SEI = "__nao_sei__";

export function OnboardingForm({ concursos }: { concursos: Concurso[] }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [concursoId, setConcursoId] = useState<string>(concursos[0]?.id ?? NOVO);
  const [novoNome, setNovoNome] = useState("");
  const [nivel, setNivel] = useState<"fundamental" | "medio" | "superior">("superior");
  const [horasPorDia, setHorasPorDia] = useState(2);
  const [dataProva, setDataProva] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (concursoId === AINDA_NAO_SEI) {
      // Usuário ainda não decidiu o concurso — só vai direto para o dashboard,
      // sem criar meta nem cronograma.
      router.push("/dashboard");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let idFinal = concursoId;

    if (concursoId === NOVO) {
      if (!novoNome.trim()) {
        setErro("Digite o nome do concurso que você pretende fazer.");
        setEnviando(false);
        return;
      }
      const { data, error } = await supabase
        .from("concursos")
        .insert({
          nome: novoNome.trim(),
          nivel,
          status: "previsto",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (error || !data) {
        setErro("Não foi possível cadastrar o concurso. Tente novamente.");
        setEnviando(false);
        return;
      }
      idFinal = data.id;
    }

    await supabase.from("metas_concurso").upsert(
      {
        user_id: user.id,
        concurso_id: idFinal,
        data_prova: dataProva || null,
        horas_semanais_meta: horasPorDia * 7,
      },
      { onConflict: "user_id,concurso_id" }
    );

    // Monta um cronograma inicial simples de segunda a sexta com as matérias do edital,
    // caso existam. O usuário pode editar tudo depois em /dashboard/cronograma.
    const { data: materias } = await supabase
      .from("materias")
      .select("id, nome")
      .eq("concurso_id", idFinal)
      .order("ordem");

    if (materias && materias.length > 0) {
      const diasUteis = [1, 2, 3, 4, 5]; // segunda a sexta
      const itens = diasUteis.map((dia, i) => ({
        user_id: user.id,
        concurso_id: idFinal,
        materia_id: materias[i % materias.length].id,
        titulo: `Estudar ${materias[i % materias.length].nome}`,
        dia_semana: dia,
        duracao_minutos: Math.max(30, Math.round((horasPorDia * 60) / 1)),
      }));
      await supabase.from("cronograma_itens").insert(itens);
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Qual concurso você pretende fazer?</label>
        <select
          value={concursoId}
          onChange={(e) => setConcursoId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {concursos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} {c.orgao ? `· ${c.orgao}` : ""}
            </option>
          ))}
          <option value={NOVO}>Outro concurso (vou digitar)</option>
          <option value={AINDA_NAO_SEI}>Ainda não decidi</option>
        </select>
      </div>

      {concursoId === NOVO && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Nome do concurso</label>
            <input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Tribunal Regional do Trabalho - Técnico"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Nível</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value as "fundamental" | "medio" | "superior")}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="fundamental">Fundamental</option>
              <option value="medio">Médio</option>
              <option value="superior">Superior</option>
            </select>
          </div>
        </div>
      )}

      {concursoId !== AINDA_NAO_SEI && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Horas de estudo por dia</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={horasPorDia}
              onChange={(e) => setHorasPorDia(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Data da prova (se souber)</label>
            <input
              type="date"
              value={dataProva}
              onChange={(e) => setDataProva(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {enviando ? "Preparando seu painel..." : "Começar a estudar"}
      </button>
    </form>
  );
}
