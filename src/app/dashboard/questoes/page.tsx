import { createClient } from "@/lib/supabase/server";
import { PraticaQuestoes } from "@/components/pratica-questoes";

export default async function QuestoesPage() {
  const supabase = await createClient();

  const { data: concursos } = await supabase
    .from("concursos")
    .select("id, nome")
    .order("nome");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Banco de questões</h1>
      <p className="mt-1 text-sm text-ink-500">
        Filtre por concurso e matéria, responda e acompanhe seu desempenho em tempo real.
      </p>

      <div className="mt-6">
        <PraticaQuestoes concursos={concursos ?? []} />
      </div>
    </div>
  );
}
