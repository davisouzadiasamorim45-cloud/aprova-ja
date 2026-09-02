import { redirect } from "next/navigation";
import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: concursos } = await supabase
    .from("concursos")
    .select("id, nome, orgao, nivel")
    .order("nome");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grain px-4 py-10">
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-ink-200/70 bg-white p-8 shadow-soft-lg">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Compass className="h-5 w-5" strokeWidth={1.9} />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">Vamos te direcionar para o concurso certo</h1>
        <p className="mt-1 text-sm text-ink-500">
          Responda rapidinho pra gente montar seu cronograma inicial e recomendar o conteúdo certo.
        </p>

        <div className="mt-6">
          <OnboardingForm concursos={concursos ?? []} />
        </div>
      </div>
    </div>
  );
}
