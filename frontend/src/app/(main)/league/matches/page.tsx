"use client";


import { CardMatchHeader } from "@/src/components/cardMatchHeader";
import { DialogNewMatch } from "@/src/components/dialogNewMatch";
import { MatchesTable } from "@/src/components/matchesTable";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useGetClubs } from "@/src/hooks/useGetClubs";
import { useGetMatches } from "@/src/hooks/useGetMatches";
import { useEffect, useMemo } from "react";

export default function MatchesPage() {
  const { setHeaderAction } = useHeaderAction();

  const { matches, loading: loadingMatches, getMatches } = useGetMatches();
  const { clubs, getClubs } = useGetClubs();

  useEffect(() => {
    setHeaderAction(<DialogNewMatch />);
    return () => setHeaderAction(null);
  }, [setHeaderAction]);

  useEffect(() => {
    void getMatches();
    void getClubs();
  }, [getMatches, getClubs]);

  const clubsMap = useMemo(() => {
    const map = new Map<number, string>();
    clubs.forEach((club) => {
      map.set(club.id, club.acronym);
    })
    return map;
  }, [clubs]);

  const lastMatch = useMemo(() => {
    if (!matches || matches.length === 0) return null;

    return [...matches].sort((a, b) => {
      const dateA = new Date(a.formattedDate || a.id).getTime();
      const dateB = new Date(b.formattedDate || b.id).getTime();
      return dateB - dateA;
    })[0];
  }, [matches]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="body-sm-medium text-muted-foreground">Última partida</p>

        {loadingMatches ? (
          <div className="flex h-32 w-full items-center justify-center rounded-xl border border-border bg-card text-muted-foreground caption-xs">
            Carregando última partida...
          </div>
        ) : lastMatch ? (
          <CardMatchHeader
            match={{
              id: lastMatch.id,
              playedAt: lastMatch.formattedDate,
              home: {
                clubId: lastMatch.homeClubId,
                clubName: lastMatch.homeClubName,
                formation: "2-1-1",
                goals: lastMatch.homeGoals,
              },
              away: {
                clubId: lastMatch.awayClubId,
                clubName: lastMatch.awayClubName,
                formation: "2-1-1",
                goals: lastMatch.awayGoals,
              },
              result:
                lastMatch.homeGoals > lastMatch.awayGoals
                  ? "VITORIA_MANDANTE"
                  : lastMatch.awayGoals > lastMatch.homeGoals
                    ? "VITORIA_VISITANTE"
                    : "EMPATE",
              duels: [],
            }}
            homeAcronym={clubsMap.get(lastMatch.homeClubId) || "MAN"}
            awayAcronym={clubsMap.get(lastMatch.awayClubId) || "VIS"}
            showViewDuelsButton={true}
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-xl border border-border bg-card text-muted-foreground caption-xs">
            Nenhuma partida registrada ainda.
          </div>
        )}
      </div>
      <MatchesTable />
      <p className="body-sm text-muted-foreground">
        Partidas da mais recente para a mais antiga, com filtro por clube. “Ver
        duelos” abre a partida.
      </p>
    </div>
  );
}
