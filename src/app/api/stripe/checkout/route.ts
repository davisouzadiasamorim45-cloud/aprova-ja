import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe/client";

// Cria uma sessão de checkout do Stripe para o usuário assinar um plano pago.
// Chamado a partir da página /dashboard/planos.
export async function POST(request: Request) {
  const { plano } = (await request.json()) as { plano: "pro" | "premium" };
  const priceId = STRIPE_PRICE_IDS[plano];

  if (!priceId) {
    return NextResponse.json(
      { error: "Plano indisponível: configure STRIPE_PRICE_ID_PRO / STRIPE_PRICE_ID_PREMIUM no .env." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const { data: assinatura } = await supabase
      .from("assinaturas")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: assinatura?.stripe_customer_id ?? undefined,
      customer_email: assinatura?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/planos?sucesso=1`,
      cancel_url: `${origin}/dashboard/planos?cancelado=1`,
      metadata: { user_id: user.id, plano },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao iniciar checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
