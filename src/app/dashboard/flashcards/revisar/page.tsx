import { createClient } from "@/lib/supabase/server";
import { RevisarFlashcards } from "@/components/revisar-flashcards";

export default async function RevisarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hoje = new Date().toISOString().slice(0, 10);

  const { data: cards } = await supabase
    .from("flashcards")
    .select("id, frente, verso, intervalo_dias, fator_facilidade, repeticoes")
    .eq("user_id", user!.id)
    .lte("proxima_revisao", hoje)
    .order("proxima_revisao");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Revisão de hoje</h1>
      <p className="mt-1 text-sm text-ink-500">
        Avalie sua lembrança de cada cartão — os próximos intervalos se ajustam automaticamente.
      </p>

      <div className="mt-6">
        <RevisarFlashcards cardsIniciais={cards ?? []} />
      </div>
    </div>
  );
}
