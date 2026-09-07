"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Layers } from "lucide-react";
import { dispararConfete } from "@/lib/confete";
import { buttonClass } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

/** Aviso + confete dos cantos: nada pendente, ninguém vai para uma tela vazia. */
function comemorarTudoEmDia() {
  dispararConfete();
  toast.sucesso("Tudo em dia por hoje!", {
    descricao: "Nenhum cartão pendente para revisão. Volte amanhã.",
  });
}

/**
 * Com cartões pendentes, é um link normal para a revisão. Sem pendências,
 * comemora ali mesmo — seja no clique do botão ou ao chegar do dashboard com
 * `?tudoemdia=1` (o card de lá redireciona para cá em vez de abrir a tela vazia).
 */
export function RevisarHojeBotao({ pendentes }: { pendentes: number }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tudoemdia") !== "1") return;

    comemorarTudoEmDia();
    params.delete("tudoemdia");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, []);

  const rotulo = (
    <>
      <Layers className="h-4 w-4" /> Revisar hoje ({pendentes})
    </>
  );

  if (pendentes > 0) {
    return (
      <Link href="/dashboard/flashcards/revisar" className={buttonClass("primary", "md", "gap-2")}>
        {rotulo}
      </Link>
    );
  }

  return (
    <button type="button" onClick={comemorarTudoEmDia} className={buttonClass("primary", "md", "gap-2")}>
      {rotulo}
    </button>
  );
}
