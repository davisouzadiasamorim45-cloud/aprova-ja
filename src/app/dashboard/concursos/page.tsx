import { createClient } from "@/lib/supabase/server";
import { CatalogoConcursos } from "@/components/catalogo-concursos";

export default async function ConcursosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: concursos }, { data: minhasMetas }] = await Promise.all([
    supabase.from("concursos").select("id, nome, orgao, banca, ano, nivel, status").order("created_at", { ascending: false }),
    supabase.from("metas_concurso").select("concurso_id").eq("user_id", user!.id),
  ]);

  const idsSeguidos = new Set((minhasMetas ?? []).map((m) => m.concurso_id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Concursos</h1>
      <p className="mt-1 text-sm text-slate-500">Escolha um concurso do catálogo ou cadastre um novo para acompanhar.</p>

      <div className="mt-6">
        <CatalogoConcursos concursos={concursos ?? []} idsSeguidos={idsSeguidos} />
      </div>
    </div>
  );
}
