import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

export type DiaEstatistica = { dia: string; total: number; acertos: number };

function formatarData(iso: string) {
  // "iso" é uma data pura (YYYY-MM-DD); acrescentar hora local evita que o
  // JS interprete como meia-noite UTC e "volte" um dia em fusos negativos.
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/**
 * Barras de questões respondidas por dia.
 *
 * As colunas precisam de altura própria (h-full): a barra é dimensionada em
 * porcentagem, e porcentagem contra um pai de altura automática resolve para
 * zero — foi assim que o gráfico ficou invisível por um tempo.
 */
export function GraficoDias({ dias }: { dias: DiaEstatistica[] }) {
  const maximo = Math.max(...dias.map((d) => d.total), 1);

  return (
    <Card className="mt-3 flex h-40 gap-1.5 p-4">
      {dias.map((d) => {
        const altura = d.total > 0 ? Math.max(8, (d.total / maximo) * 100) : 0;
        const taxa = d.total > 0 ? Math.round((d.acertos / d.total) * 100) : 0;

        return (
          <div
            key={d.dia}
            className="group flex h-full flex-1 flex-col items-center gap-1.5"
            title={d.total > 0 ? `${d.total} questões · ${taxa}% de acerto` : "Nenhuma questão neste dia"}
          >
            <div className="flex w-full flex-1 items-end">
              {d.total > 0 ? (
                <div
                  className="flex w-full flex-col justify-end overflow-hidden rounded-t bg-ink-100"
                  style={{ height: `${altura}%` }}
                >
                  {/* Parte cheia = acertos; o restante da barra fica no tom neutro,
                      então dá para ler volume e aproveitamento na mesma coluna.
                      A porção colorida cresce a partir da base (justify-end) —
                      margem em porcentagem não serviria aqui, porque porcentagem
                      de margem é calculada sobre a LARGURA do pai, não a altura. */}
                  <div
                    className={cn(
                      "w-full shrink-0 transition-colors",
                      taxa >= 70 ? "bg-brand-500" : taxa >= 50 ? "bg-gold-500" : "bg-red-500"
                    )}
                    style={{ height: `${taxa}%` }}
                  />
                </div>
              ) : (
                <div className="h-1 w-full rounded-full bg-ink-100" />
              )}
            </div>
            <span className="text-[9px] text-ink-400">{formatarData(d.dia)}</span>
          </div>
        );
      })}
    </Card>
  );
}
