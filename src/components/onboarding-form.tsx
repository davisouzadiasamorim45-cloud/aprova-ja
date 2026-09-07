"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";

type Concurso = { id: string; nome: string; orgao: string | null; nivel: string | null; estado?: string | null };

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
        <Label>Qual concurso você pretende fazer?</Label>
        <Select value={concursoId} onChange={(e) => setConcursoId(e.target.value)}>
          {concursos.map((c) => (
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
        </div>
      )}

      {concursoId !== AINDA_NAO_SEI && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Horas de estudo por dia</Label>
            <Input
              type="number"
              min={0.5}
              step={0.5}
              value={horasPorDia}
              onChange={(e) => setHorasPorDia(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Data da prova (se souber)</Label>
            <Input type="date" value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
          </div>
        </div>
      )}

      {erro && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {erro}
        </p>
      )}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Preparando seu painel..." : "Começar a estudar"}
      </Button>
    </form>
  );
}
