"use client";

import { ChartBar } from "lucide-react";

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

const labels: Array<[keyof PlayerStats, string]> = [
  ["pace", "Velocidade"],
  ["shooting", "Finalização"],
  ["passing", "Passe"],
  ["dribbling", "Drible"],
  ["defending", "Defesa"],
  ["physical", "Físico"],
];

export function StatsPreview({ stats }: { stats: PlayerStats }) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-2.5 rounded-xl border border-border bg-muted p-3 lg:w-61">
      <div className="flex items-center gap-1.5 text-xs body-sm-medium text-muted-foreground">
        <ChartBar size={14} aria-hidden="true" />
        Prévia dos atributos
      </div>
      {labels.map(([key, label]) => {
        const value = Math.max(0, Math.min(99, stats[key]));
        return (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-17.5 shrink-0 caption-xs text-muted-foreground">
              {label}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-soft">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${value}%` }}
              />
            </span>
            <span className="w-5 text-right caption-xs-medium text-foreground">
              {value}
            </span>
          </div>
        );
      })}
      <p className="pt-1 text-xs leading-4 text-muted-foreground">
        Faixa clara: até o potencial ({Math.max(...Object.values(stats))}). A
        prévia só desenha os valores digitados; não calcula overall nem valor
        base.
      </p>
    </aside>
  );
}
