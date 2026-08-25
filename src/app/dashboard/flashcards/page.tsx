import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Baralhos } from "@/components/baralhos";

export default async function FlashcardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hoje = new Date().toISOString().slice(0, 10);

  const [{ data: baralhos }, { count: pendentes }] = await Promise.all([
    supabase.from("baralhos").select("id, nome, concurso_id").eq("user_id", user!.id).order("created_at"),
    supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .lte("proxima_revisao", hoje),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
          <p className="mt-1 text-sm text-slate-500">Memorize com repetição espaçada (algoritmo SM-2).</p>
        </div>
        <Link
          href="/dashboard/flashcards/revisar"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Revisar hoje ({pendentes ?? 0})
        </Link>
      </div>

      <div className="mt-6">
        <Baralhos baralhosIniciais={baralhos ?? []} />
      </div>
    </div>
  );
}
