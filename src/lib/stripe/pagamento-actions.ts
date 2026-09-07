"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe/client";

async function assinaturaDoUsuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("assinaturas")
    .select("stripe_customer_id, stripe_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export type PagamentoState = { error?: string } | undefined;

/**
 * Cria um SetupIntent pra adicionar um cartão novo com o Stripe Elements
 * embutido na nossa tela — o número do cartão nunca passa pelo nosso
 * servidor, só o token que a Stripe devolve depois de confirmado no client.
 */
export async function criarSetupIntentAction(): Promise<{ clientSecret?: string; error?: string }> {
  const assinatura = await assinaturaDoUsuario();
  if (!assinatura?.stripe_customer_id) {
    return { error: "Nenhuma conta de cobrança encontrada. Assine um plano primeiro." };
  }

  try {
    const intent = await getStripe().setupIntents.create({
      customer: assinatura.stripe_customer_id,
      payment_method_types: ["card"],
    });
    return { clientSecret: intent.client_secret ?? undefined };
  } catch {
    return { error: "Não foi possível preparar o formulário de cartão agora." };
  }
}

export async function definirCartaoPrincipalAction(_prev: PagamentoState, formData: FormData): Promise<PagamentoState> {
  const paymentMethodId = String(formData.get("payment_method_id") || "");
  const assinatura = await assinaturaDoUsuario();
  if (!assinatura?.stripe_customer_id || !paymentMethodId) {
    return { error: "Não foi possível identificar o cartão." };
  }

  try {
    await getStripe().customers.update(assinatura.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  } catch {
    return { error: "Não foi possível definir esse cartão como principal." };
  }

  revalidatePath("/dashboard/planos");
}

export async function removerCartaoAction(_prev: PagamentoState, formData: FormData): Promise<PagamentoState> {
  const paymentMethodId = String(formData.get("payment_method_id") || "");
  const assinatura = await assinaturaDoUsuario();
  if (!assinatura?.stripe_customer_id || !paymentMethodId) {
    return { error: "Não foi possível identificar o cartão." };
  }

  const stripe = getStripe();

  // Não deixa remover o único cartão de quem tem assinatura ativa — senão a
  // próxima cobrança falha sem ninguém perceber até o e-mail de falha chegar.
  if (assinatura.status === "active") {
    const metodos = await stripe.paymentMethods.list({ customer: assinatura.stripe_customer_id, type: "card" });
    if (metodos.data.length <= 1) {
      return { error: "Adicione outro cartão antes de remover este — sua assinatura ativa precisa de uma forma de pagamento." };
    }
  }

  try {
    await stripe.paymentMethods.detach(paymentMethodId);
  } catch {
    return { error: "Não foi possível remover esse cartão." };
  }

  revalidatePath("/dashboard/planos");
}

export async function cancelarAssinaturaAction(): Promise<PagamentoState> {
  const assinatura = await assinaturaDoUsuario();
  if (!assinatura?.stripe_subscription_id) {
    return { error: "Nenhuma assinatura ativa encontrada." };
  }

  try {
    // Cancela no fim do período já pago, não na hora — quem pagou o mês não
    // perde o acesso que já é dele.
    await getStripe().subscriptions.update(assinatura.stripe_subscription_id, { cancel_at_period_end: true });
  } catch {
    return { error: "Não foi possível cancelar agora. Tente novamente." };
  }

  revalidatePath("/dashboard/planos");
}

export async function reativarAssinaturaAction(): Promise<PagamentoState> {
  const assinatura = await assinaturaDoUsuario();
  if (!assinatura?.stripe_subscription_id) {
    return { error: "Nenhuma assinatura encontrada." };
  }

  try {
    await getStripe().subscriptions.update(assinatura.stripe_subscription_id, { cancel_at_period_end: false });
  } catch {
    return { error: "Não foi possível reativar agora. Tente novamente." };
  }

  revalidatePath("/dashboard/planos");
}

export async function trocarPlanoAction(_prev: PagamentoState, formData: FormData): Promise<PagamentoState> {
  const novoPlano = String(formData.get("plano") || "") as "pro" | "premium";
  const priceId = STRIPE_PRICE_IDS[novoPlano];
  if (!priceId) {
    return { error: "Esse plano não está disponível no momento." };
  }

  const assinatura = await assinaturaDoUsuario();
  if (!assinatura?.stripe_subscription_id) {
    return { error: "Você ainda não tem uma assinatura paga pra trocar de plano — assine primeiro." };
  }

  const stripe = getStripe();
  try {
    const sub = await stripe.subscriptions.retrieve(assinatura.stripe_subscription_id);
    const itemId = sub.items.data[0]?.id;
    if (!itemId) return { error: "Não foi possível localizar sua assinatura." };

    await stripe.subscriptions.update(assinatura.stripe_subscription_id, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "create_prorations",
      cancel_at_period_end: false,
    });
  } catch {
    return { error: "Não foi possível trocar de plano agora. Tente novamente." };
  }

  revalidatePath("/dashboard/planos");
}
