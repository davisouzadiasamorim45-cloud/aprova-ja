import { createClient } from "@/lib/supabase/server";
import { Cronograma } from "@/components/cronograma";

export default async function CronogramaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: metas }, { data: itens }] = await Promise.all([
    supabase.from("metas_concurso").select("concurso_id").eq("user_id", user!.id),
    supabase
      .from("cronograma_itens")
      .select("id, titulo, dia_semana, duracao_minutos, concluido, concurso_id")
      .eq("user_id", user!.id)
      .order("dia_semana"),
  ]);

  // O seletor só oferece os concursos que a pessoa segue, mas ainda precisamos
  // do nome dos concursos usados em itens antigos (que ela pode ter deixado de
  // seguir) para não exibir um item sem identificação.
  const idsSeguidos = (metas ?? []).map((m) => m.concurso_id);
  const idsEmUso = (itens ?? []).map((i) => i.concurso_id).filter((id): id is string => Boolean(id));
  const ids = [...new Set([...idsSeguidos, ...idsEmUso])];

  const { data: concursos } = ids.length
    ? await supabase.from("concursos").select("id, nome").in("id", ids).order("nome")
    : { data: [] };

  const seguidos = new Set(idsSeguidos);
  const nomesConcurso = Object.fromEntries((concursos ?? []).map((c) => [c.id, c.nome]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Cronograma de estudos</h1>
      <p className="mt-1 text-sm text-ink-500">
        Organize sua semana por matéria, marque o que já foi feito e cronometre cada sessão de estudo.
      </p>

      <div className="mt-6">
        <Cronograma
          concursos={(concursos ?? []).filter((c) => seguidos.has(c.id))}
          nomesConcurso={nomesConcurso}
          itensIniciais={itens ?? []}
        />
      </div>
    </div>
  );
}
