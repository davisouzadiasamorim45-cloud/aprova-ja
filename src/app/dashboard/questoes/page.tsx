import { createClient } from "@/lib/supabase/server";
import { PraticaQuestoes } from "@/components/pratica-questoes";

export default async function QuestoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: metas } = await supabase.from("metas_concurso").select("concurso_id").eq("user_id", user!.id);
  const idsSeguidos = (metas ?? []).map((m) => m.concurso_id);

  // Só mostra os concursos que a pessoa está seguindo — evita uma lista longa
  // de concursos sem relação com o objetivo dela. Se ainda não seguir nenhum
  // (ex: escolheu "ainda não decidi" no cadastro), mostra o catálogo todo.
  const concursosQuery = supabase.from("concursos").select("id, nome").order("nome");
  const { data: concursos } =
    idsSeguidos.length > 0 ? await concursosQuery.in("id", idsSeguidos) : await concursosQuery;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Banco de questões</h1>
      <p className="mt-1 text-sm text-ink-500">
        {idsSeguidos.length > 0
          ? "Filtre por matéria entre os concursos que você está seguindo, responda e acompanhe seu desempenho em tempo real."
          : "Filtre por concurso e matéria, responda e acompanhe seu desempenho em tempo real."}
      </p>

      <div className="mt-6">
        <PraticaQuestoes concursos={concursos ?? []} />
      </div>
    </div>
  );
}
