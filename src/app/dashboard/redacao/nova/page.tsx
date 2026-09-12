import { createClient } from "@/lib/supabase/server";
import { EnviarRedacaoForm } from "@/components/enviar-redacao-form";
import { UpsellRedacaoPremium } from "@/components/upsell-redacao-premium";
import { Card } from "@/components/ui/card";

export default async function NovaRedacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user!.id).maybeSingle();
  const ehPremium = profile?.plan === "premium";

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Nova redação</h1>
      <p className="mt-1 text-sm text-ink-500">
        Cole o tema/proposta e o seu texto — a correção sai por competência, nos moldes de uma banca.
      </p>

      <div className="mt-6">
        {ehPremium ? (
          <Card className="p-6">
            <EnviarRedacaoForm />
          </Card>
        ) : (
          <UpsellRedacaoPremium />
        )}
      </div>
    </div>
  );
}
