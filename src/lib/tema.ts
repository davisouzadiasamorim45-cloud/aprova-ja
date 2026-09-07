"use client";

import { useSyncExternalStore } from "react";

export type Tema = "light" | "dark" | "sepia";

export const TEMAS: { id: Tema; nome: string; descricao: string }[] = [
  { id: "light", nome: "Claro", descricao: "Fundo claro, papel levemente amarelado." },
  { id: "dark", nome: "Escuro", descricao: "Fundo escuro, ideal para ambientes com pouca luz." },
  { id: "sepia", nome: "Sépia", descricao: "Tom de papel envelhecido, mais aconchegante para leitura longa." },
];

const TEMAS_VALIDOS = new Set<Tema>(TEMAS.map((t) => t.id));

const EVENTO_TEMA = "aprovaja:theme-change";
const CHAVE_STORAGE = "theme";

export function ehTema(valor: string | null): valor is Tema {
  return valor !== null && TEMAS_VALIDOS.has(valor as Tema);
}

function obterTema(): Tema {
  const atual = document.documentElement.getAttribute("data-theme");
  return ehTema(atual) ? atual : "light";
}

// Servidor sempre "light" (mesmo valor da 1ª pintura no cliente, antes do
// script inline no <head> já ter aplicado o tema real) — useSyncExternalStore
// resolve a diferença sem gerar warning de hidratação nem precisar de effect.
function obterTemaNoServidor(): Tema {
  return "light";
}

function inscrever(ouvinte: () => void) {
  window.addEventListener(EVENTO_TEMA, ouvinte);
  return () => window.removeEventListener(EVENTO_TEMA, ouvinte);
}

/** Aplica o tema (usado tanto pelo toggle rápido quanto pelo seletor completo). */
export function definirTema(tema: Tema) {
  document.documentElement.setAttribute("data-theme", tema);
  try {
    localStorage.setItem(CHAVE_STORAGE, tema);
  } catch {
    // Sem localStorage (modo privado etc.) — o tema ainda muda nesta página,
    // só não persiste pra próxima.
  }
  window.dispatchEvent(new Event(EVENTO_TEMA));
}

/**
 * Múltiplas instâncias (sidebar + página de perfil + landing, por exemplo)
 * ficam sincronizadas via um evento simples no window.
 */
export function useTema(): Tema {
  return useSyncExternalStore(inscrever, obterTema, obterTemaNoServidor);
}
