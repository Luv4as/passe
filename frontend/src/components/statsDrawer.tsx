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

export function StatsDrawer({ stats }: { stats: PlayerStats }) {
  return (
    <div className="w-full space-y-2.5">
      {labels.map(([key, label]) => {
        const value = Math.max(0, Math.min(99, stats[key]));
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-20 shrink-0 caption-xs text-muted-foreground">
              {label}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-6 text-right caption-xs-medium font-semibold text-foreground">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
