'use client'

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useGetMatches } from "../hooks/useGetMatches";
import { useEffect, useMemo } from "react";
import { useGetClubs } from "../hooks/useGetClubs";

export function CardLastMatch() {
    const { getMatches, matches, loading: loadingMatches, error } = useGetMatches()
    const { getClubs, clubs, loading: loadingClubs } = useGetClubs();

    useEffect(() => {
        getMatches();
        getClubs();
    }, [getMatches, getClubs]);

    const clubsMap = useMemo(() => {
        const map = new Map<number, string>();
        clubs.forEach((club) => {
            map.set(club.id, club.acronym);
        });
        return map;
    }, [clubs]);

    const lastMatch = useMemo(() => {
        if (matches.length === 0) return null;

        return [...matches].sort((a, b) => {
            const dateA = new Date(a.formattedDate || a.id).getTime();
            const dateB = new Date(b.formattedDate || b.id).getTime();
            return dateB - dateA;
        })[0];
    }, [matches]);

    if (loadingMatches || loadingClubs || !lastMatch) return null;

    const homeAcronym = clubsMap.get(lastMatch.homeClubId) || "N/A";
    const awayAcronym = clubsMap.get(lastMatch.awayClubId) || "N/A";

    const getResultText = () => {
        if (lastMatch.homeGoals > lastMatch.awayGoals) {
            return `Vitória do Mandante`;
        }
        if (lastMatch.awayGoals > lastMatch.homeGoals) {
            return `Vitória do Visitante`;
        }
        return "Empate";
    };

    return (

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5 border border-border rounded-xl bg-card">
            <div />
            {error && (
                <div className="text-destructive-soft">Erro ao carregar a última partida.</div>
            )}
            <div className="flex flex-row items-center gap-4 justify-center">
                <div className="flex flex-col text-right">
                    <p className="heading-card text-foreground">{lastMatch.homeClubName}</p>
                    <p className="caption-xs text-muted-foreground">Mandante</p>
                </div>
                <span className="flex body-sm-semibold py-1.5 px-2.5 border border-border rounded-xl text-foreground">
                    {homeAcronym}
                </span>

                <div className="flex flex-col items-center mx-2">
                    <p className="display text-foreground">{lastMatch.homeGoals} X {lastMatch.awayGoals}</p>
                    <p className="caption-xs text-muted-foreground">{lastMatch.formattedDate}</p>
                    <span className="caption-xs-medium text-foreground py-0.5 px-2 border border-border rounded-xl mt-1">
                        {getResultText()}
                    </span>
                </div>

                <span className="flex body-sm-semibold py-1.5 px-2.5 border border-border rounded-xl text-foreground">
                    {awayAcronym}
                </span>
                <div className="flex flex-col text-left">
                    <p className="heading-card text-foreground">{lastMatch.awayClubName}</p>
                    <p className="caption-xs text-muted-foreground">Visitante</p>
                </div>
            </div>

            <div className="justify-self-end">
                <Button variant={"outline"}>
                    Ver duelos
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>

    )
}
