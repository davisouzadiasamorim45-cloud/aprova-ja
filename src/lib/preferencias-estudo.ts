"use client";

import { useSyncExternalStore } from "react";

/**
 * Preferências do cronômetro de estudo. Ficam no localStorage (não no banco)
 * porque são ajustes do aparelho — volume e alarme fazem sentido por
 * dispositivo, não por conta.
 */
export type PreferenciasEstudo = {
  /** Toca um bip quando o tempo planejado do item termina. */
  somAlerta: boolean;
  /** Por quanto tempo o bip fica tocando ao atingir a meta. */
  segundosAlerta: number;
  /** 0 a 1. */
  volumeAlerta: number;
  /** Marca o item como concluído automaticamente ao parar o cronômetro. */
  concluirAoParar: boolean;
};

export const PREFERENCIAS_PADRAO: PreferenciasEstudo = {
  somAlerta: true,
  segundosAlerta: 10,
  volumeAlerta: 0.4,
  concluirAoParar: true,
};

const CHAVE = "aprovaja:preferencias-estudo";
const EVENTO = "aprovaja:preferencias-change";

function normalizar(bruto: unknown): PreferenciasEstudo {
  const p = (bruto ?? {}) as Partial<PreferenciasEstudo>;
  return {
    somAlerta: typeof p.somAlerta === "boolean" ? p.somAlerta : PREFERENCIAS_PADRAO.somAlerta,
    // Limites evitam um alarme eterno (ou mudo) vindo de um valor estragado.
    segundosAlerta: Math.min(60, Math.max(1, Number(p.segundosAlerta) || PREFERENCIAS_PADRAO.segundosAlerta)),
    volumeAlerta: Math.min(1, Math.max(0, Number.isFinite(p.volumeAlerta) ? Number(p.volumeAlerta) : PREFERENCIAS_PADRAO.volumeAlerta)),
    concluirAoParar: typeof p.concluirAoParar === "boolean" ? p.concluirAoParar : PREFERENCIAS_PADRAO.concluirAoParar,
  };
}

export function lerPreferencias(): PreferenciasEstudo {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return normalizar(bruto ? JSON.parse(bruto) : null);
  } catch {
    return PREFERENCIAS_PADRAO;
  }
}

export function salvarPreferencias(parcial: Partial<PreferenciasEstudo>) {
  const proximo = normalizar({ ...lerPreferencias(), ...parcial });
  try {
    localStorage.setItem(CHAVE, JSON.stringify(proximo));
  } catch {
    // Sem localStorage (aba privada): vale só para esta sessão.
  }
  cache = proximo;
  window.dispatchEvent(new Event(EVENTO));
  return proximo;
}

// useSyncExternalStore exige um snapshot estável entre renders — por isso o
// objeto lido fica em cache e só é refeito quando alguém salva.
let cache: PreferenciasEstudo | null = null;

function snapshot(): PreferenciasEstudo {
  if (!cache) cache = lerPreferencias();
  return cache;
}

function snapshotServidor(): PreferenciasEstudo {
  return PREFERENCIAS_PADRAO;
}

function inscrever(ouvinte: () => void) {
  const aoMudar = () => {
    cache = null;
    ouvinte();
  };
  window.addEventListener(EVENTO, aoMudar);
  // Mudou em outra aba.
  window.addEventListener("storage", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

export function usePreferenciasEstudo(): PreferenciasEstudo {
  return useSyncExternalStore(inscrever, snapshot, snapshotServidor);
}
