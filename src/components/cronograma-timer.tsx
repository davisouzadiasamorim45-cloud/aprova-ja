"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { tocarAlarme } from "@/lib/alarme";
import { usePreferenciasEstudo } from "@/lib/preferencias-estudo";
import { Button } from "@/components/ui/button";

const CHAVE_TIMER = "aprovaja:timer-estudo";

type EstadoTimer = {
  itemId: string;
  /** Guardado junto do estado para o cronômetro se descrever sozinho em
   *  qualquer tela do dashboard, sem depender da lista do cronograma. */
  titulo: string;
  subtitulo: string | null;
  duracaoMinutos: number;
  /** Tempo já contado nas rodadas anteriores (antes da pausa atual). */
  acumuladoMs: number;
  /** Momento em que a contagem atual começou; null = pausado. */
  iniciadoEm: number | null;
  /** Evita repetir o alarme a cada tick depois que a meta é atingida. */
  alertado: boolean;
};

export type ItemCronometravel = {
  id: string;
  titulo: string;
  subtitulo?: string | null;
  duracaoMinutos: number;
};

type Instantaneo = {
  itemAtivoId: string | null;
  titulo: string;
  subtitulo: string | null;
  metaMs: number;
  decorridoMs: number;
  rodando: boolean;
  atingiuMeta: boolean;
  alertado: boolean;
};

const VAZIO: Instantaneo = {
  itemAtivoId: null,
  titulo: "",
  subtitulo: null,
  metaMs: 0,
  decorridoMs: 0,
  rodando: false,
  atingiuMeta: false,
  alertado: false,
};

// ---------------------------------------------------------------------------
// O cronômetro vive fora do React (store + setInterval próprios) e é lido com
// useSyncExternalStore: assim o "agora" nunca é calculado durante a renderização
// e o tempo continua correndo ao navegar entre as telas do dashboard.
// Só existe um cronômetro por vez — a pessoa estuda uma coisa de cada vez.
// ---------------------------------------------------------------------------
let estado: EstadoTimer | null = null;
let carregado = false;
let instantaneo: Instantaneo = VAZIO;
let intervalo: number | null = null;
let pararAlarmeAtual: (() => void) | null = null;
const ouvintes = new Set<() => void>();

function lerEstadoSalvo(): EstadoTimer | null {
  try {
    const bruto = localStorage.getItem(CHAVE_TIMER);
    if (!bruto) return null;
    const e = JSON.parse(bruto) as EstadoTimer;
    if (!e || typeof e.itemId !== "string" || typeof e.titulo !== "string") return null;
    return {
      itemId: e.itemId,
      titulo: e.titulo,
      subtitulo: typeof e.subtitulo === "string" ? e.subtitulo : null,
      duracaoMinutos: Number(e.duracaoMinutos) || 0,
      acumuladoMs: Number(e.acumuladoMs) || 0,
      iniciadoEm: typeof e.iniciadoEm === "number" ? e.iniciadoEm : null,
      alertado: Boolean(e.alertado),
    };
  } catch {
    return null;
  }
}

function persistir() {
  try {
    if (estado) localStorage.setItem(CHAVE_TIMER, JSON.stringify(estado));
    else localStorage.removeItem(CHAVE_TIMER);
  } catch {
    // Sem localStorage: o cronômetro funciona, só não sobrevive ao reload.
  }
}

function recalcular() {
  if (!estado) {
    instantaneo = VAZIO;
    return;
  }
  const metaMs = estado.duracaoMinutos * 60_000;
  const decorridoMs = estado.acumuladoMs + (estado.iniciadoEm ? Date.now() - estado.iniciadoEm : 0);
  instantaneo = {
    itemAtivoId: estado.itemId,
    titulo: estado.titulo,
    subtitulo: estado.subtitulo,
    metaMs,
    decorridoMs,
    rodando: estado.iniciadoEm !== null,
    atingiuMeta: metaMs > 0 && decorridoMs >= metaMs,
    alertado: estado.alertado,
  };
}

function avisar() {
  recalcular();
  for (const ouvinte of ouvintes) ouvinte();
}

function ajustarIntervalo() {
  const precisa = Boolean(estado?.iniciadoEm) && ouvintes.size > 0;
  if (precisa && intervalo === null) intervalo = window.setInterval(avisar, 500);
  if (!precisa && intervalo !== null) {
    window.clearInterval(intervalo);
    intervalo = null;
  }
}

function definirEstado(proximo: EstadoTimer | null) {
  estado = proximo;
  persistir();
  avisar();
  ajustarIntervalo();
}

function silenciar() {
  pararAlarmeAtual?.();
  pararAlarmeAtual = null;
}

function inscrever(ouvinte: () => void) {
  if (!carregado) {
    carregado = true;
    estado = lerEstadoSalvo();
    recalcular();
  }
  ouvintes.add(ouvinte);
  ajustarIntervalo();
  return () => {
    ouvintes.delete(ouvinte);
    ajustarIntervalo();
  };
}

function obterInstantaneo() {
  return instantaneo;
}

function obterInstantaneoNoServidor() {
  return VAZIO;
}

export function formatarDuracao(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const doisDigitos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${doisDigitos(m)}:${doisDigitos(s)}` : `${doisDigitos(m)}:${doisDigitos(s)}`;
}

export function useTimerEstudo() {
  const atual = useSyncExternalStore(inscrever, obterInstantaneo, obterInstantaneoNoServidor);

  function iniciar(item: ItemCronometravel) {
    silenciar();
    definirEstado(
      estado && estado.itemId === item.id
        ? { ...estado, iniciadoEm: estado.iniciadoEm ?? Date.now() }
        : {
            itemId: item.id,
            titulo: item.titulo,
            subtitulo: item.subtitulo ?? null,
            duracaoMinutos: item.duracaoMinutos,
            acumuladoMs: 0,
            iniciadoEm: Date.now(),
            alertado: false,
          }
    );
  }

  function alternarPausa() {
    if (!estado) return;
    silenciar();
    definirEstado(
      estado.iniciadoEm
        ? { ...estado, acumuladoMs: estado.acumuladoMs + (Date.now() - estado.iniciadoEm), iniciadoEm: null }
        : { ...estado, iniciadoEm: Date.now() }
    );
  }

  function zerar() {
    if (!estado) return;
    silenciar();
    definirEstado({ ...estado, acumuladoMs: 0, iniciadoEm: estado.iniciadoEm ? Date.now() : null, alertado: false });
  }

  function parar() {
    silenciar();
    definirEstado(null);
  }

  return { ...atual, iniciar, alternarPausa, zerar, parar };
}

/**
 * Toca o alarme quando a meta é atingida. Deve ser usado em UM lugar só que
 * esteja sempre montado (o widget flutuante do layout) — senão o bip dispara
 * uma vez por tela montada.
 */
export function useAlarmeTimer(atingiuMeta: boolean, alertado: boolean) {
  const preferencias = usePreferenciasEstudo();

  useEffect(() => {
    if (!atingiuMeta || alertado) return;
    if (estado) definirEstado({ ...estado, alertado: true });
    if (!preferencias.somAlerta) return;
    silenciar();
    pararAlarmeAtual = tocarAlarme({ segundos: preferencias.segundosAlerta, volume: preferencias.volumeAlerta });
  }, [atingiuMeta, alertado, preferencias]);

  useEffect(() => silenciar, []);
}

export function PainelTimer({
  titulo,
  subtitulo,
  decorridoMs,
  metaMs,
  rodando,
  atingiuMeta,
  onAlternarPausa,
  onZerar,
  onParar,
}: {
  titulo: string;
  subtitulo?: string | null;
  decorridoMs: number;
  metaMs: number;
  rodando: boolean;
  atingiuMeta: boolean;
  onAlternarPausa: () => void;
  onZerar: () => void;
  onParar: () => void;
}) {
  const progresso = metaMs > 0 ? Math.min(1, decorridoMs / metaMs) : 0;
  const restanteMs = metaMs - decorridoMs;

  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border p-5 shadow-soft transition-colors",
        atingiuMeta ? "border-gold-400 bg-gold-50" : "border-brand-300 bg-brand-50"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            {atingiuMeta ? "Meta atingida — tempo extra" : rodando ? "Estudando agora" : "Pausado"}
          </p>
          <p className="mt-0.5 truncate text-base font-semibold text-ink-900">{titulo}</p>
          {subtitulo && <p className="truncate text-xs text-ink-500">{subtitulo}</p>}
        </div>
        <p
          className={cn(
            "font-display text-4xl font-semibold tabular-nums",
            atingiuMeta ? "text-gold-700" : "text-brand-700"
          )}
        >
          {formatarDuracao(decorridoMs)}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-200/70">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", atingiuMeta ? "bg-gold-500" : "bg-brand-500")}
          style={{ width: `${progresso * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-ink-500">
        {metaMs === 0
          ? "Sem tempo planejado"
          : atingiuMeta
            ? `${formatarDuracao(-restanteMs)} além dos ${Math.round(metaMs / 60_000)}min planejados`
            : `Faltam ${formatarDuracao(restanteMs)} dos ${Math.round(metaMs / 60_000)}min planejados`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onAlternarPausa} size="sm" className="min-w-28">
          {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {rodando ? "Pausar" : "Retomar"}
        </Button>
        <Button onClick={onZerar} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4" /> Zerar
        </Button>
        <Button onClick={onParar} variant="secondary" size="sm">
          <Square className="h-4 w-4" /> Parar
        </Button>
      </div>
    </div>
  );
}
