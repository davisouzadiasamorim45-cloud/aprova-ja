import { createClient } from "@/lib/supabase/server";
import { PLANOS } from "@/lib/planos";
import { PlanosCliente } from "@/components/planos-cliente";
import { MetodosPagamento } from "@/components/metodos-pagamento";
import { AssinaturaAcoes } from "@/components/assinatura-acoes";
import { buscarInfoPagamento } from "@/lib/stripe/pagamento";

export default async function PlanosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("plano, status, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user!.id)
    .maybeSingle();

  const planoAtual = assinatura?.plano ?? "free";
  const { metodos, assinatura: infoStripe } = await buscarInfoPagamento(
    assinatura?.stripe_customer_id,
    assinatura?.stripe_subscription_id
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Plano e assinatura</h1>
      <p className="mt-1 text-sm text-ink-500">
        Plano atual: <span className="font-semibold capitalize text-ink-700">{planoAtual}</span>
        {assinatura?.status === "active" && " · assinatura ativa"}
      </p>

      {planoAtual !== "free" && (
        <>
          <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Sua assinatura</h2>
          <div className="mt-3">
            <AssinaturaAcoes planoAtual={planoAtual} canceladaNoFim={infoStripe?.canceladaNoFim ?? false} fimPeriodo={infoStripe?.fimPeriodo ?? null} />
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Forma de pagamento</h2>
          <p className="mt-1 text-sm text-ink-500">Cartão principal e cartões extras usados na cobrança.</p>
          <div className="mt-3">
            <MetodosPagamento metodos={metodos} />
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink-900">Trocar de plano</h2>
        </>
      )}

      <PlanosCliente planos={PLANOS} planoAtual={planoAtual} temAssinatura={!!assinatura?.status && assinatura.status !== "inactive"} />

      <p className="mt-8 text-xs text-ink-400">
        Integração de cobrança via Stripe. Para ativar pagamentos reais, configure as chaves do Stripe (secreta e
        publicável) e os Price IDs dos planos Pro/Premium nas variáveis de ambiente (veja o README).
      </p>
    </div>
  );
}
