"use client";

import { ClubPlayerItem } from "@/src/hooks/useGetClub";
import { Lock } from "lucide-react";

interface LineupReservesProps {
  allPlayers: ClubPlayerItem[];
  selectedPlayerIds: (number | null)[];
}

export function LineupReserves({ allPlayers, selectedPlayerIds }: LineupReservesProps) {
  const reserves = allPlayers.filter(
    (p) => !selectedPlayerIds.includes(p.id)
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col items-start gap-1">
        <h4 className="heading-card text-foreground">Reservas</h4>
        <p className="caption-xs text-muted-foreground">
          Jogadores do elenco fora da escalação.
        </p>
      </div>

      {reserves.length === 0 ? (
        <div className="rounded-lg bg-muted/40 p-4 text-center caption-xs text-muted-foreground">
          Nenhum reserva: os {allPlayers.length} jogadores do elenco estão escolhidos.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {reserves.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-lg border border-border p-2.5 bg-background"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="body-sm-medium text-foreground">{player.name}</span>
                  <span className="caption-xs text-muted-foreground">{player.position}</span>
                </div>
              </div>

              <div>
                {player.condition === "DOENTE" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2.5 py-0.5 caption-xs-medium text-destructive">
                    <span className="size-1.5 rounded-full bg-destructive" />
                    Doente
                  </span>
                ) : player.condition === "MAL_CONDICIONADO" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 caption-xs-medium text-warning-soft-foreground">
                    <span className="size-1.5 rounded-full bg-warning" />
                    Mal condicionado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 caption-xs-medium text-success-soft-foreground">
                    <span className="size-1.5 rounded-full bg-success" />
                    Apto
                  </span>
                )}
              </div>
            </div>
          ))}

          {reserves.some((p) => p.condition === "DOENTE") && (
            <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5 caption-xs text-muted-foreground">
              <Lock size={14} className="shrink-0" />
              Doente não pode ser escalado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}