"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { definirTema, useTema } from "@/lib/tema";

/**
 * Alternância rápida de 2 estados (claro/escuro) para as páginas públicas —
 * landing e telas de autenticação, onde não há um menu de configurações. O
 * terceiro tema (sépia) só é escolhível pelo seletor completo, na página de
 * Perfil; clicar aqui nunca resulta em sépia, só alterna entre os outros dois.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const tema = useTema();
  const escuro = tema === "dark";

  return (
    <button
      type="button"
      onClick={() => definirTema(escuro ? "light" : "dark")}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={escuro ? "Modo claro" : "Modo escuro"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900",
        className
      )}
    >
      {escuro ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.9} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.9} />}
    </button>
  );
}
