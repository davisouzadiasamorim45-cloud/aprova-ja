"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { ESTADOS } from "@/lib/estados";

export type AuthState = { error?: string; confirmacaoPendente?: string } | undefined;

export async function signInAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Conta criada mas nunca confirmada: mensagem específica, senão a pessoa
    // fica tentando a senha achando que errou.
    if (error.code === "email_not_confirmed" || error.message.toLowerCase().includes("not confirmed")) {
      return { confirmacaoPendente: email };
    }
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

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, estado },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: error.message.includes("registered") ? "Este e-mail já está cadastrado." : "Não foi possível criar a conta." };
  }

  // Com "Confirm email" ligado no Supabase, o signUp não devolve sessão: a
  // pessoa precisa clicar no link do e-mail. Sem avisar, o redirect abaixo
  // cairia no /login (via onboarding) e pareceria que o cadastro quebrou.
  if (!data.session) {
    return { confirmacaoPendente: email };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export type ReenviarConfirmacaoState = { error?: string; sucesso?: boolean } | undefined;

/** Reenvia o e-mail de confirmação de cadastro (link expirado ou não recebido). */
export async function reenviarConfirmacaoAction(
  _prevState: ReenviarConfirmacaoState,
  formData: FormData
): Promise<ReenviarConfirmacaoState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` },
  });

  if (error) {
    return { error: "Não foi possível reenviar agora. Tente novamente em instantes." };
  }

  return { sucesso: true };
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

export type AlterarSenhaState = { error?: string; sucesso?: boolean } | undefined;

/**
 * Troca de senha pra quem já está logado (diferente do fluxo de
 * recuperação, que é pra quem esqueceu e está deslogado). Confirma a senha
 * atual reautenticando com signInWithPassword antes de trocar — o Supabase
 * não tem um "verificar senha" direto, então é assim que se garante que
 * quem está mexendo na sessão sabe a senha de verdade, não só tem a aba aberta.
 */
export async function alterarSenhaAction(_prevState: AlterarSenhaState, formData: FormData): Promise<AlterarSenhaState> {
  const senhaAtual = String(formData.get("senha_atual") || "");
  const novaSenha = String(formData.get("nova_senha") || "");
  const confirmacao = String(formData.get("nova_senha_confirm") || "");

  if (!senhaAtual) {
    return { error: "Informe sua senha atual." };
  }
  if (novaSenha.length < 6) {
    return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  }
  if (novaSenha !== confirmacao) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const { error: erroAuth } = await supabase.auth.signInWithPassword({ email: user.email, password: senhaAtual });
  if (erroAuth) {
    return { error: "Senha atual incorreta." };
  }

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) {
    return { error: "Não foi possível trocar sua senha agora. Tente novamente." };
  }

  return { sucesso: true };
}

export type AlterarEmailState = { error?: string; sucesso?: boolean } | undefined;

/**
 * Troca de e-mail: confirma a senha atual (mesma lógica de reautenticação
 * do alterarSenhaAction) e dispara o fluxo do Supabase, que por padrão exige
 * confirmação tanto no e-mail antigo quanto no novo ("secure email change")
 * antes de efetivar a troca — o e-mail em `user.email` só muda depois disso.
 */
export async function alterarEmailAction(_prevState: AlterarEmailState, formData: FormData): Promise<AlterarEmailState> {
  const senhaAtual = String(formData.get("senha_atual") || "");
  const novoEmail = String(formData.get("novo_email") || "").trim();

  if (!senhaAtual) {
    return { error: "Informe sua senha atual." };
  }
  if (!novoEmail || !novoEmail.includes("@")) {
    return { error: "Informe um e-mail válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  if (novoEmail.toLowerCase() === user.email.toLowerCase()) {
    return { error: "Esse já é o seu e-mail atual." };
  }

  const { error: erroAuth } = await supabase.auth.signInWithPassword({ email: user.email, password: senhaAtual });
  if (erroAuth) {
    return { error: "Senha atual incorreta." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const { error } = await supabase.auth.updateUser(
    { email: novoEmail },
    { emailRedirectTo: `${origin}/auth/callback?next=/dashboard/perfil/seguranca` }
  );

  if (error) {
    return { error: error.message.includes("registered") ? "Esse e-mail já está em uso." : "Não foi possível iniciar a troca agora. Tente novamente." };
  }

  return { sucesso: true };
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
