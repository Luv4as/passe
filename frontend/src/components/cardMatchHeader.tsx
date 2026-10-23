"use client";

import { Button } from "@/components/ui/button";
import { MatchDetails } from "@/src/hooks/useGetMatch";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CardMatchHeaderProps {
  match: MatchDetails;
  homeAcronym?: string;
  awayAcronym?: string;
  showViewDuelsButton?: boolean;
}

export function CardMatchHeader({
  match,
  homeAcronym = "MAN",
  awayAcronym = "VIS",
  showViewDuelsButton = false,
}: CardMatchHeaderProps) {
  const router = useRouter();

  const getResultText = () => {
    if (match.home.goals > match.away.goals) return "Vitória do Mandante";
    if (match.away.goals > match.home.goals) return "Vitória do Visitante";
    return "Empate";
  };

  const formattedDate = new Date(match.playedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5 border border-border rounded-xl bg-card">
      <div />

      {/* Infos da Partida */}
      <div className="flex flex-row items-center gap-4 justify-center">
        {/* Mandante */}
        <div className="flex flex-col text-right">
          <p className="heading-card text-foreground">{match.home.clubName}</p>
          <p className="caption-xs text-muted-foreground">Mandante</p>
        </div>

        <span className="flex body-sm-semibold py-1.5 px-2.5 border border-border rounded-xl text-foreground">
          {homeAcronym}
        </span>

        {/* Placar e Data */}
        <div className="flex flex-col items-center mx-2">
          <p className="display text-foreground">
            {match.home.goals} X {match.away.goals}
          </p>
          <p className="caption-xs text-muted-foreground">{formattedDate}</p>
          <span className="caption-xs-medium text-foreground py-0.5 px-2 border border-border rounded-xl mt-1">
            {getResultText()}
          </span>
        </div>

        {/* Visitante */}
        <span className="flex body-sm-semibold py-1.5 px-2.5 border border-border rounded-xl text-foreground">
          {awayAcronym}
        </span>

        <div className="flex flex-col text-left">
          <p className="heading-card text-foreground">{match.away.clubName}</p>
          <p className="caption-xs text-muted-foreground">Visitante</p>
        </div>
      </div>

      {/* Botão Ver Duelos (opcional) */}
      <div className="justify-self-end">
        {showViewDuelsButton && (
          <Button
            variant="outline"
            onClick={() => router.push(`/league/matches/${match.id}`)}
          >
            Ver duelos
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}