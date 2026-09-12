"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { enviarRedacaoAction, transcreverImagemAction } from "@/lib/redacao/actions";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

export function EnviarRedacaoForm() {
  const [state, formAction, pending] = useActionState(enviarRedacaoAction, undefined);
  const [texto, setTexto] = useState("");
  const [transcrevendo, setTranscrevendo] = useState(false);
  const inputImagemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) toast.erro(state.error);
  }, [state]);

  async function aoEscolherImagem(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite escolher a mesma foto de novo depois, se precisar
    if (!arquivo) return;

    setTranscrevendo(true);
    const formData = new FormData();
    formData.set("imagem", arquivo);

    const resultado = await transcreverImagemAction(formData);
    setTranscrevendo(false);

    if (resultado.error) {
      toast.erro(resultado.error);
      return;
    }

    setTexto((atual) => (atual.trim() ? `${atual}\n\n${resultado.texto}` : resultado.texto ?? ""));
    toast.sucesso("Foto transcrita", { descricao: "Revise o texto abaixo — leitura de letra manuscrita pode errar." });
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="tema">Tema ou proposta</Label>
        <Textarea
          id="tema"
          name="tema"
          required
          minLength={10}
          rows={3}
          placeholder="Cole aqui o tema/proposta da redação (pode incluir os textos de apoio)."
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="texto">Sua redação</Label>
          <button
            type="button"
            onClick={() => inputImagemRef.current?.click()}
            disabled={transcrevendo}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {transcrevendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}
            {transcrevendo ? "Lendo a letra..." : "Enviar foto da redação escrita à mão"}
          </button>
          <input
            ref={inputImagemRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            className="hidden"
            onChange={aoEscolherImagem}
          />
        </div>
        <Textarea
          id="texto"
          name="texto"
          required
          minLength={200}
          maxLength={8000}
          rows={16}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva, cole, ou envie uma foto da sua redação escrita à mão."
          className="mt-1.5"
        />
        <p className="mt-1.5 text-xs text-ink-400">
          Mínimo de 200 caracteres. Depois de transcrever uma foto, revise o texto antes de enviar — a leitura de
          letra manuscrita pode errar. Isso é uma ferramenta de treino: a nota não substitui a correção oficial da
          banca.
        </p>
      </div>

      <Button type="submit" disabled={pending || transcrevendo} className="self-start">
        {pending ? "Corrigindo... (leva alguns segundos)" : "Enviar para correção"}
      </Button>
    </form>
  );
}
