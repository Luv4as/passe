"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGetMatches } from "../hooks/useGetMatches";
import { useEffect, useMemo } from "react";

export function RecentMatchesCard() {
    const { getMatches, matches, loading, error } = useGetMatches()

    useEffect(() => {
        getMatches();
    }, [getMatches]);

    const featuredMatches = useMemo(() => {
        if(matches.length <= 2) return matches;
        return [matches[0], matches[matches.length - 1]];
    }, [matches]);

    return (
        <section className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <header className="border-b border-border p-4">
                <h3 className="heading-card text-foreground font-bold">Últimas partidas</h3>
                <p className="body-sm text-muted-foreground mt-0.5">
                    Da mais recente para a mais antiga.
                </p>
            </header>

            <div className="flex flex-col gap-4 p-4">
                {loading ? (
                    <p className="body-sm text-muted-foreground text-center py-2">Carregando...</p>
                ) : error ? (
                    <p className="body-sm text-destructive text-center py-2">{error}</p>
                ) : matches.length === 0 ? (
                    <p className="body-sm text-muted-foreground text-center py-2">
                        Nenhuma partida jogada ainda.
                    </p>
                ) : (
                    featuredMatches.map((match) => {
                        const homeWon = match.homeGoals > match.awayGoals;
                        const awayWon = match.awayGoals > match.homeGoals;

                        return (
                            <div key={match.id} className="flex flex-col gap-1.5">
                                <span className="caption-xs text-muted-foreground">
                                    {match.formattedDate}
                                </span>

                                <div className="flex items-center gap-2 body-sm">
                                    <span className={`flex-1 text-right truncate ${homeWon ? "font-bold text-foreground" : "text-foreground"}`}>
                                        {match.homeClubName}
                                    </span>

                                    <span className="flex items-center justify-center rounded-lg bg-muted px-2.5 py-0.5 body-sm-semibold font-bold text-foreground shrink-0">
                                        {match.homeGoals} × {match.awayGoals}
                                    </span>

                                    <span className={`flex-1 text-left truncate ${awayWon ? "font-bold text-foreground" : "text-foreground"}`}>
                                        {match.awayClubName}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                <Link
                    href="/market/matches"
                    className="inline-flex items-center justify-center gap-1.5 body-sm-semibold text-primary hover:underline pt-2"
                >
                    Ver todas as partidas
                    <ArrowRight size={16} />
                </Link>
            </div>
        </section>
    );
}