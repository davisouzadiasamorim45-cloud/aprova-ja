"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { recorrigirAction } from "@/lib/redacao/actions";
import { Button } from "@/components/ui/button";

/** Reenvia a correção de uma redação com status "erro" — chamado direto como Server Action, sem form. */
export function BotaoTentarNovamenteRedacao({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => recorrigirAction(id))}
      className="gap-2"
    >
      <RotateCcw className="h-4 w-4" /> {pending ? "Corrigindo..." : "Tentar novamente"}
    </Button>
  );
}
