"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { corrigirRedacao } from "./corrigir";
import { comoMediaTypeImagem, transcreverRedacaoDaImagem } from "./transcrever";

const TEMA_MIN = 10;
const TEXTO_MIN = 200;
const TEXTO_MAX = 8000;
const IMAGEM_TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MENSAGEM_PREMIUM = "Correção de redação com IA é um recurso do plano Premium.";

/**
 * Recurso pago (chamada de IA por trás): confere aqui, no servidor, e não só
 * escondendo botão na tela — quem chama a action direto não pode furar o gate.
 */
async function temPlanoPremium(supabase: SupabaseServerClient, userId: string): Promise<boolean> {
  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", userId).maybeSingle();
  return profile?.plan === "premium";
}

/**
 * Roda a correção e grava o resultado (ou o erro) na própria linha. Nunca
 * lança — se der errado (chave ausente, API fora, resposta fora do schema),
 * a redação fica com status "erro" e quem pediu pode tentar de novo depois,
 * sem perder o texto que já escreveu.
 */
async function executarCorrecao(supabase: SupabaseServerClient, id: string, tema: string, texto: string) {
  try {
    const resultado = await corrigirRedacao(tema, texto);
    await supabase
      .from("redacoes")
      .update({
        status: "corrigida",
        nota_final: resultado.nota_final,
        competencias: resultado.competencias,
        pontos_fortes: resultado.pontos_fortes,
        pontos_a_melhorar: resultado.pontos_a_melhorar,
        comentario_geral: resultado.comentario_geral,
        corrigida_at: new Date().toISOString(),
        erro: null,
      })
      .eq("id", id);
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido ao corrigir.";
    await supabase.from("redacoes").update({ status: "erro", erro: mensagem }).eq("id", id);
  }
}

export type EnviarRedacaoState = { error?: string } | undefined;

export async function enviarRedacaoAction(_prevState: EnviarRedacaoState, formData: FormData): Promise<EnviarRedacaoState> {
  const tema = String(formData.get("tema") || "").trim();
  const texto = String(formData.get("texto") || "").trim();
  const concursoId = String(formData.get("concurso_id") || "").trim() || null;

  if (tema.length < TEMA_MIN) {
    return { error: "Descreva o tema ou a proposta com um pouco mais de detalhe." };
  }
  if (texto.length < TEXTO_MIN) {
    return { error: `Sua redação está curta demais pra uma correção útil (mínimo de ${TEXTO_MIN} caracteres).` };
  }
  if (texto.length > TEXTO_MAX) {
    return { error: `Sua redação passou do limite de ${TEXTO_MAX.toLocaleString("pt-BR")} caracteres.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await temPlanoPremium(supabase, user.id))) {
    return { error: MENSAGEM_PREMIUM };
  }

  const { data: redacao, error: erroInsert } = await supabase
    .from("redacoes")
    .insert({ user_id: user.id, tema, texto, concurso_id: concursoId })
    .select("id")
    .single();

  if (erroInsert || !redacao) {
    return { error: "Não foi possível salvar sua redação agora. Tente novamente." };
  }

  await executarCorrecao(supabase, redacao.id, tema, texto);

  revalidatePath("/dashboard/redacao");
  redirect(`/dashboard/redacao/${redacao.id}`);
}

export type TranscreverImagemState = { texto?: string; error?: string };

/**
 * Transcreve a foto de uma redação manuscrita — chamada direto do cliente
 * (sem <form>) quando a pessoa escolhe um arquivo. Devolve o texto pra
 * pessoa revisar/editar antes de enviar pra correção normal; nunca corrige
 * nem grava nada sozinha.
 */
export async function transcreverImagemAction(formData: FormData): Promise<TranscreverImagemState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Recarregue a página e entre de novo." };

  if (!(await temPlanoPremium(supabase, user.id))) {
    return { error: MENSAGEM_PREMIUM };
  }

  const arquivo = formData.get("imagem");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione uma foto da sua redação." };
  }
  if (arquivo.size > IMAGEM_TAMANHO_MAX) {
    return { error: "Essa imagem passa de 10 MB — tente uma foto com menos resolução." };
  }
  const mediaType = comoMediaTypeImagem(arquivo.type);
  if (!mediaType) {
    return { error: "Envie a foto em PNG, JPEG ou WEBP." };
  }

  try {
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const texto = await transcreverRedacaoDaImagem(buffer.toString("base64"), mediaType);
    return { texto };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível ler essa imagem agora." };
  }
}

/** Reenvia pra correção uma redação que ficou com status "erro" (ex: chave da IA não configurada ainda). */
export async function recorrigirAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!(await temPlanoPremium(supabase, user.id))) {
    redirect("/dashboard/planos");
  }

  const { data: redacao } = await supabase
    .from("redacoes")
    .select("id, tema, texto")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!redacao) redirect("/dashboard/redacao");

  await executarCorrecao(supabase, redacao.id, redacao.tema, redacao.texto);
  revalidatePath(`/dashboard/redacao/${id}`);
}
