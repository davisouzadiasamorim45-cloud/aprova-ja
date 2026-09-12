import { getAnthropic, MODELO_PADRAO } from "@/lib/anthropic/client";

export type MediaTypeImagem = "image/jpeg" | "image/png" | "image/webp";

const TIPOS_ACEITOS: readonly MediaTypeImagem[] = ["image/jpeg", "image/png", "image/webp"];

/** Narrowing seguro do mime type do arquivo pro union que a API da Anthropic aceita. */
export function comoMediaTypeImagem(tipo: string): MediaTypeImagem | null {
  return (TIPOS_ACEITOS as readonly string[]).includes(tipo) ? (tipo as MediaTypeImagem) : null;
}

const PROMPT_SISTEMA_TRANSCRICAO = `Você transcreve fotos de redações escritas à mão para provas de concurso público.

Regras:
- Transcreva o texto EXATAMENTE como está escrito, palavra por palavra — inclusive erros de ortografia, gramática ou pontuação do candidato. Quem vai avaliar esses erros é outra etapa; sua única tarefa é ler a letra manuscrita com fidelidade.
- Não corrija, não resuma, não comente. Só transcreva.
- Mantenha a divisão em parágrafos do texto original.
- Se algum trecho estiver realmente ilegível, marque com "[ilegível]" no lugar, sem inventar palavras.
- Se a imagem não tiver texto manuscrito legível nenhum, responda apenas: SEM_TEXTO
- Responda só com o texto transcrito (ou SEM_TEXTO), sem nenhum comentário antes ou depois.`;

/**
 * Manda a foto pra Claude e devolve o texto manuscrito transcrito. Quem chama
 * é responsável por deixar a pessoa revisar/editar antes de mandar pra
 * correção — leitura de letra manuscrita erra, e o erro não pode virar nota.
 */
export async function transcreverRedacaoDaImagem(base64: string, mediaType: MediaTypeImagem): Promise<string> {
  const client = getAnthropic();

  const message = await client.messages.create({
    model: MODELO_PADRAO,
    max_tokens: 4096,
    system: PROMPT_SISTEMA_TRANSCRICAO,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: "Transcreva o texto manuscrito desta foto." },
        ],
      },
    ],
  });

  const bloco = message.content.find((b) => b.type === "text");
  const texto = bloco && bloco.type === "text" ? bloco.text.trim() : "";

  if (!texto || texto === "SEM_TEXTO") {
    throw new Error("Não encontrei texto legível nessa foto. Tente tirar com mais luz e foco.");
  }

  return texto;
}
