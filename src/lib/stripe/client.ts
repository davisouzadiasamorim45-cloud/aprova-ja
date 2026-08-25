import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Cliente Stripe (lazy) — evita quebrar o build quando a chave ainda não foi
 * configurada em ambientes de preview/demo.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY não configurada. Defina as variáveis de ambiente do Stripe (veja README.md)."
      );
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

// IDs de preço do Stripe para cada plano pago. Configure em variáveis de ambiente
// depois de criar os produtos/preços no Dashboard do Stripe.
export const STRIPE_PRICE_IDS: Record<"pro" | "premium", string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
  premium: process.env.STRIPE_PRICE_ID_PREMIUM,
};
