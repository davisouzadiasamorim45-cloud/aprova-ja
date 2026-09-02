import { createClient } from "@/lib/supabase/server";
import { Cronograma } from "@/components/cronograma";

export default async function CronogramaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: concursos }, { data: itens }] = await Promise.all([
    supabase.from("concursos").select("id, nome").order("nome"),
    supabase
      .from("cronograma_itens")
      .select("id, titulo, dia_semana, duracao_minutos, concluido, concurso_id")
      .eq("user_id", user!.id)
      .order("dia_semana"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Cronograma de estudos</h1>
      <p className="mt-1 text-sm text-ink-500">Organize sua semana de estudos por matéria e acompanhe o que já foi feito.</p>

      <div className="mt-6">
        <Cronograma concursos={concursos ?? []} itensIniciais={itens ?? []} />
      </div>
    </div>
  );
}
