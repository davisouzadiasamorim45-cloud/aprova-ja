"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { ESTADOS } from "@/lib/estados";

export type AuthState = { error?: string } | undefined;

export async function signInAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const estado = String(formData.get("estado") || "").trim().toUpperCase();

  if (!fullName || !email || !password || !estado) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (!ESTADOS.some((e) => e.uf === estado)) {
    return { error: "Selecione um estado válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, estado } },
  });

  if (error) {
    return { error: error.message.includes("registered") ? "Este e-mail já está cadastrado." : "Não foi possível criar a conta." };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export type RecuperarSenhaState = { error?: string; sucesso?: boolean } | undefined;

/**
 * Dispara o e-mail de recuperação de senha do Supabase. Sempre retorna
 * sucesso (mesmo se o e-mail não existir) pra não revelar quais e-mails
 * têm conta cadastrada — o próprio Supabase já segue essa prática.
 */
export async function recuperarSenhaAction(_prevState: RecuperarSenhaState, formData: FormData): Promise<RecuperarSenhaState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  if (error) {
    return { error: "Não foi possível enviar o link agora. Tente novamente em instantes." };
  }

  return { sucesso: true };
}

export type RedefinirSenhaState = { error?: string } | undefined;

/**
 * Troca a senha da conta. Só funciona com a sessão temporária que o link do
 * e-mail de recuperação cria (via /auth/callback) — sem isso, getUser()
 * retorna nulo e barramos aqui.
 */
export async function redefinirSenhaAction(_prevState: RedefinirSenhaState, formData: FormData): Promise<RedefinirSenhaState> {
  const senha = String(formData.get("password") || "");
  const confirmacao = String(formData.get("password_confirm") || "");

  if (senha.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmacao) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Link expirado ou inválido. Solicite um novo link de recuperação." };
  }

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    return { error: "Não foi possível redefinir sua senha agora. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?senha_redefinida=1");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

const PALAVRA_CONFIRMACAO = "EXCLUIR";
const ASSINATURA_ATIVA = new Set(["active", "trialing", "past_due"]);

export type ExcluirContaState = { error?: string } | undefined;

/**
 * Exclusão de conta (direito de eliminação da LGPD). Cancela a assinatura no
 * Stripe antes de apagar — senão a cobrança continuaria rodando pra uma conta
 * que não existe mais — e então remove o usuário do Auth. O resto (perfil,
 * tentativas, flashcards, cronograma, assinatura) cai em cascata pelas FKs já
 * definidas nas migrations; concursos/questões que a pessoa cadastrou ficam
 * (são conteúdo de catálogo compartilhado), só perdem o autor.
 */
export async function excluirContaAction(_prevState: ExcluirContaState, formData: FormData): Promise<ExcluirContaState> {
  const confirmacao = String(formData.get("confirmacao") || "").trim().toUpperCase();
  if (confirmacao !== PALAVRA_CONFIRMACAO) {
    return { error: `Digite ${PALAVRA_CONFIRMACAO} para confirmar.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("stripe_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (assinatura?.stripe_subscription_id && ASSINATURA_ATIVA.has(assinatura.status)) {
    try {
      await getStripe().subscriptions.cancel(assinatura.stripe_subscription_id);
    } catch {
      // Segue mesmo se o Stripe falhar: excluir a conta não pode ficar refém
      // da cobrança. Uma assinatura órfã fica visível pro time no dashboard
      // do Stripe pra cancelamento manual.
    }
  }

  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: "Não foi possível excluir sua conta agora. Tente novamente em instantes." };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
