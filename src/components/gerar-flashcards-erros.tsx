"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

/**
 * Monta cartões a partir das questões cuja última tentativa foi errada. Todo o
 * trabalho acontece na função SQL gerar_flashcards_de_erros (migration 0006) —
 * o conteúdo vem do próprio banco de questões, sem IA.
 */
export function GerarFlashcardsErros() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);

    const { data, error } = await supabase.rpc("gerar_flashcards_de_erros");

    if (error) {
      toast.erro("Não foi possível gerar os cartões", { descricao: "Tente de novo em instantes." });
    } else if (!data) {
      toast.info("Nenhuma questão errada nova", {
        descricao: "Responda mais questões na prática para alimentar este baralho.",
      });
    } else {
      toast.sucesso(data === 1 ? "1 cartão novo criado" : `${data} cartões novos criados`, {
        descricao: "Estão no baralho “Questões que errei”.",
      });
      router.refresh();
    }

    setGerando(false);
  }

  return (
    <Button onClick={gerar} disabled={gerando} variant="outline">
      <Wand2 className="h-4 w-4" /> {gerando ? "Gerando..." : "Gerar dos meus erros"}
    </Button>
  );
}
