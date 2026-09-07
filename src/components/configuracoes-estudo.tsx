"use client";

import { useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";
import { tocarAlarme } from "@/lib/alarme";
import { salvarPreferencias, usePreferenciasEstudo } from "@/lib/preferencias-estudo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

function Linha({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-200/70 py-4 last:border-b-0">
      <div className="min-w-0 max-w-md">
        <p className="text-sm font-medium text-ink-800">{titulo}</p>
        <p className="mt-0.5 text-xs text-ink-500">{descricao}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function ConfiguracoesEstudo() {
  const preferencias = usePreferenciasEstudo();
  const pararTeste = useRef<(() => void) | null>(null);

  useEffect(() => () => pararTeste.current?.(), []);

  function testarSom() {
    pararTeste.current?.();
    pararTeste.current = tocarAlarme({ segundos: preferencias.segundosAlerta, volume: preferencias.volumeAlerta });
  }

  return (
    <Card className="px-5 py-1">
      <Linha
        titulo="Alarme ao atingir o tempo planejado"
        descricao="Toca um bip quando a sessão chega no tempo que você planejou. O cronômetro continua contando até você parar."
      >
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={preferencias.somAlerta}
            onChange={(e) => salvarPreferencias({ somAlerta: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          />
          {preferencias.somAlerta ? "Ligado" : "Desligado"}
        </label>
      </Linha>

      <Linha titulo="Duração do alarme" descricao="Por quantos segundos o bip fica tocando (de 1 a 60).">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={60}
            value={preferencias.segundosAlerta}
            onChange={(e) => salvarPreferencias({ segundosAlerta: Number(e.target.value) })}
            disabled={!preferencias.somAlerta}
            className="w-24"
            aria-label="Segundos de alarme"
          />
          <span className="text-sm text-ink-500">segundos</span>
        </div>
      </Linha>

      <Linha titulo="Volume do alarme" descricao="Ajuste e use “Testar som” para ouvir como vai ficar.">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(preferencias.volumeAlerta * 100)}
            onChange={(e) => salvarPreferencias({ volumeAlerta: Number(e.target.value) / 100 })}
            disabled={!preferencias.somAlerta}
            aria-label="Volume do alarme"
            className="w-36 accent-brand-600 disabled:opacity-50"
          />
          <Button type="button" variant="outline" size="sm" onClick={testarSom} disabled={!preferencias.somAlerta}>
            <Volume2 className="h-4 w-4" /> Testar som
          </Button>
        </div>
      </Linha>

      <Linha
        titulo="Marcar como concluído ao parar"
        descricao="Quando você parar o cronômetro, o item do cronograma é marcado como feito automaticamente."
      >
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={preferencias.concluirAoParar}
            onChange={(e) => salvarPreferencias({ concluirAoParar: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          />
          {preferencias.concluirAoParar ? "Ligado" : "Desligado"}
        </label>
      </Linha>

      <div className="pb-4">
        <p className="text-xs text-ink-400">
          Estas preferências ficam salvas neste aparelho — em outro celular ou computador é possível configurar de outro jeito.
        </p>
      </div>
    </Card>
  );
}
