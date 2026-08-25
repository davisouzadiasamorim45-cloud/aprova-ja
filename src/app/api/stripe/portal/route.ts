import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

// Abre o Portal do Cliente do Stripe (gerenciar/cancelar assinatura, trocar cartão).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!assinatura?.stripe_customer_id) {
    return NextResponse.json({ error: "Você ainda não tem uma assinatura ativa." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
    const session = await stripe.billingPortal.sessions.create({
      customer: assinatura.stripe_customer_id,
      return_url: `${origin}/dashboard/planos`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao abrir o portal de cobrança.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
