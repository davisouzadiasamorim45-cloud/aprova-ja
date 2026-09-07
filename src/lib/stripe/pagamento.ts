import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";

export type MetodoPagamento = {
  id: string;
  bandeira: string;
  final: string;
  expMes: number;
  expAno: number;
  principal: boolean;
};

export type InfoAssinaturaStripe = {
  status: Stripe.Subscription.Status;
  canceladaNoFim: boolean;
  fimPeriodo: string | null;
};

export type InfoPagamento = {
  metodos: MetodoPagamento[];
  assinatura: InfoAssinaturaStripe | null;
};

/**
 * Busca direto no Stripe (sem cache) os cartões salvos e o estado da
 * assinatura. Só lê dados já tokenizados pela Stripe (bandeira, últimos 4
 * dígitos) — nunca número completo de cartão, isso nunca passa pelo nosso
 * servidor. Retorna vazio (sem lançar) se o Stripe não estiver configurado
 * ou a pessoa ainda não tiver cliente/assinatura — é o caso normal do plano
 * grátis.
 */
export async function buscarInfoPagamento(
  customerId: string | null | undefined,
  subscriptionId: string | null | undefined
): Promise<InfoPagamento> {
  if (!customerId) return { metodos: [], assinatura: null };

  try {
    const stripe = getStripe();

    const [customer, metodosResp, subscription] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.paymentMethods.list({ customer: customerId, type: "card" }),
      subscriptionId ? stripe.subscriptions.retrieve(subscriptionId) : Promise.resolve(null),
    ]);

    const defaultId =
      !("deleted" in customer) && customer.invoice_settings?.default_payment_method
        ? typeof customer.invoice_settings.default_payment_method === "string"
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings.default_payment_method.id
        : null;

    const metodos: MetodoPagamento[] = metodosResp.data
      .filter((m): m is Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card } => !!m.card)
      .map((m) => ({
        id: m.id,
        bandeira: m.card.brand,
        final: m.card.last4,
        expMes: m.card.exp_month,
        expAno: m.card.exp_year,
        principal: m.id === defaultId,
      }));

    return {
      metodos,
      assinatura: subscription
        ? {
            status: subscription.status,
            canceladaNoFim: subscription.cancel_at_period_end,
            fimPeriodo: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
              : null,
          }
        : null,
    };
  } catch {
    // Stripe não configurado (chave ausente em dev/preview) ou erro de rede —
    // trata como "sem informação de cobrança" em vez de quebrar a página.
    return { metodos: [], assinatura: null };
  }
}
