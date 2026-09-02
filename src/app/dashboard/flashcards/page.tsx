import Link from "next/link";
import { Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Baralhos } from "@/components/baralhos";
import { buttonClass } from "@/components/ui/button";

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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Flashcards</h1>
          <p className="mt-1 text-sm text-ink-500">Memorize com repetição espaçada (algoritmo SM-2).</p>
        </div>
        <Link href="/dashboard/flashcards/revisar" className={buttonClass("primary", "md", "gap-2")}>
          <Layers className="h-4 w-4" /> Revisar hoje ({pendentes ?? 0})
        </Link>
      </div>

      <div className="mt-6">
        <Baralhos baralhosIniciais={baralhos ?? []} />
      </div>
    </div>
  );
}
