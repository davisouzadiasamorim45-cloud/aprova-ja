import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Vamos te direcionar para o concurso certo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Responda rapidinho pra gente montar seu cronograma inicial e recomendar o conteúdo certo.
        </p>

        <div className="mt-6">
          <OnboardingForm concursos={concursos ?? []} />
        </div>
      </div>
    </div>
  );
}
