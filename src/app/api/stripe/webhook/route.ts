import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Webhook do Stripe: mantém a tabela `assinaturas` sincronizada com o
// status real da assinatura. Configure esta URL no Dashboard do Stripe
// (Developers > Webhooks) apontando para /api/stripe/webhook.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida";
    return NextResponse.json({ error: `Webhook inválido: ${message}` }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  function planoDoPriceId(priceId: string | undefined): "pro" | "premium" | "free" {
    if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
    if (priceId === STRIPE_PRICE_IDS.premium) return "premium";
    return "free";
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.user_id;
      if (!userId) break;

      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const plano = (session.metadata?.plano as "pro" | "premium") ?? "pro";

      await supabase.from("assinaturas").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plano,
          status: "active",
        },
        { onConflict: "user_id" }
      );
      await supabase.from("profiles").update({ plan: plano }).eq("id", userId);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const priceId = subscription.items.data[0]?.price.id;
      const plano = event.type === "customer.subscription.deleted" ? "free" : planoDoPriceId(priceId);
      const statusesConhecidos = ["inactive", "trialing", "active", "past_due", "canceled"] as const;
      const status: (typeof statusesConhecidos)[number] =
        event.type === "customer.subscription.deleted"
          ? "canceled"
          : (statusesConhecidos as readonly string[]).includes(subscription.status)
          ? (subscription.status as (typeof statusesConhecidos)[number])
          : "active";

      const { data: assinatura } = await supabase
        .from("assinaturas")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (assinatura?.user_id) {
        await supabase
          .from("assinaturas")
          .update({
            plano,
            status,
            periodo_atual_fim: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
              : null,
          })
          .eq("user_id", assinatura.user_id);
        await supabase.from("profiles").update({ plan: plano }).eq("id", assinatura.user_id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
