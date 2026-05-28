import { BarChart3 } from "lucide-react";
import type { CategoriaStat } from "../types";
import { brl, num } from "../utils/format";
import { Card } from "./ui";

export function Resumo({ dados, totalValor }: { dados: CategoriaStat[]; totalValor: number }) {
  if (dados.length === 0) return null;
  const max = Math.max(...dados.map((d) => d.valor));
  return (
    <Card className="p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-tx-primary flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-accent" />Resumo por categoria
      </h3>
      <div className="space-y-4">
        {dados.map((d) => {
          const pct = totalValor > 0 ? (d.valor / totalValor) * 100 : 0;
          const barW = max > 0 ? (d.valor / max) * 100 : 0;
          return (
            <div key={d.categoria}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <span className="text-xs text-tx-secondary truncate">{d.categoria}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-2xs text-tx-muted">{num(d.qtd)} un</span>
                  <span className="font-mono text-xs font-medium text-tx-primary">{brl(d.valor)}</span>
                  <span className="font-mono text-2xs text-tx-muted w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <div className="h-1 bg-bg-overlay rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${barW}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-bg-border flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-widest text-tx-muted">Total geral</span>
        <span className="font-mono text-sm font-semibold text-accent">{brl(totalValor)}</span>
      </div>
    </Card>
  );
}
