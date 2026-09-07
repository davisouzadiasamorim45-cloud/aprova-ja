import { createClient } from "@/lib/supabase/server";
import { PLANOS } from "@/lib/planos";
import { PlanosCliente } from "@/components/planos-cliente";

export default async function PlanosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("plano, status")
    .eq("user_id", user!.id)
    .maybeSingle();

  const planoAtual = assinatura?.plano ?? "free";

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Planos</h1>
      <p className="mt-1 text-sm text-ink-500">
        Plano atual: <span className="font-semibold capitalize text-ink-700">{planoAtual}</span>
        {assinatura?.status === "active" && " · assinatura ativa"}
      </p>

      <PlanosCliente planos={PLANOS} planoAtual={planoAtual} temAssinatura={!!assinatura?.status && assinatura.status !== "inactive"} />

      <p className="mt-8 text-xs text-ink-400">
        Integração de cobrança via Stripe. Para ativar pagamentos reais, configure as chaves do Stripe (secreta e
        publicável) e os Price IDs dos planos Pro/Premium nas variáveis de ambiente (veja o README).
      </p>
    </div>
  );
}
