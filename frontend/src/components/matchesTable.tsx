'use client'

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, RefreshCw, ServerOff, Shield, Swords } from "lucide-react";
import { useGetMatches } from "@/src/hooks/useGetMatches";
import { useGetClubs } from "@/src/hooks/useGetClubs";
import { ComboboxOptions } from "./comboboxOptions";
import { IconContainer } from "@/components/ui/icon-container";
import { DialogNewMatch } from "./dialogNewMatch";

export function MatchesTable() {
    const { getMatches, matches, loading: loadingMatches, error: errorMatches } = useGetMatches();
    const { getClubs, clubs, loading: loadingClubs, error: errorClubs } = useGetClubs();
    const [selectedClubId, setSelectedClubId] = useState<string>("all");

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

    const filteredMatches = useMemo(() => {
        let result = [...matches];

        if (selectedClubId !== "all" && selectedClubId !== "") {
            const clubIdNum = Number(selectedClubId);
            result = result.filter(
                (m) => m.homeClubId === clubIdNum || m.awayClubId === clubIdNum
            );
        }
        return result.sort((a, b) => {
            const dateA = new Date(a.rawDate || a.id).getTime();
            const dateB = new Date(b.rawDate || b.id).getTime();
            return dateB - dateA;
        });
    }, [matches, selectedClubId]);


    const clubFilterOptions = useMemo(() => {
        return [
            { id: "all", name: "Clube: todos" },
            ...clubs.map((c) => ({ id: c.id.toString(), name: c.name })),
        ];
    }, [clubs]);

    const getResultBadgeText = (result: "MANDANTE" | "VISITANTE" | "EMPATE") => {
        if (result === "MANDANTE") return "Vitória do mandante";
        if (result === "VISITANTE") return "Vitória do visitante";
        return "Empate";
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-row items-center justify-between border-b border-border p-6">
                <div className="flex flex-col gap-1">
                    <h3 className="heading-card text-foreground">Histórico de partidas</h3>
                    <p className="caption-xs text-muted-foreground">
                        Da mais recente para a mais antiga.
                    </p>
                </div>
                <div className="w-56">
                    <ComboboxOptions
                        icon={<Shield size={16} />}
                        placeholder="Clube: todos"
                        opcoes={clubFilterOptions}
                        value={selectedClubId}
                        onValueChange={(val) => setSelectedClubId(val)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse body-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground caption-xs-medium">
                        <tr className="h-10 border-b border-border">
                            <th className="px-6 body-sm-medium">Data e hora</th>
                            <th className="px-4 text-right body-sm-medium">Mandante</th>
                            <th className="px-4 text-center body-sm-medium">Placar</th>
                            <th className="px-4 text-left body-sm-medium">Visitante</th>
                            <th className="px-4 body-sm-medium">Resultado</th>
                            <th className="px-6 text-right body-sm-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loadingMatches || loadingClubs ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                    Carregando histórico de partidas...
                                </td>
                            </tr>
                        ) : errorMatches || errorClubs ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-destructive">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <IconContainer className="bg-muted border border-border h-12 w-12 flex items-center justify-center rounded-xl">
                                            <ServerOff size={24} className="text-muted-foreground" />
                                        </IconContainer>
                                        <p className="heading-card text-foreground font-semibold mt-1">Não foi possível carregar o histórico de partidas</p>
                                        <p className="body-sm text-muted-foreground max-w-sm">Não foi possível carregar os dados. Verifique a conexão e tente de novo.</p>
                                        <p className="body-sm text-destructive-soft">{errorMatches || errorClubs}</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}>
                                            <RefreshCw size={16} />
                                            Tentar novamente
                                        </Button>
                                    </div>
                                    
                                </td>
                            </tr>
                        ) : filteredMatches.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <IconContainer className="bg-muted border border-border h-12 w-12 flex items-center justify-center rounded-xl">
                                            <Swords size={24} className="text-muted-foreground" />
                                        </IconContainer>
                                        <p className="heading-card text-foreground font-semibold mt-1">Nenhuma partida jogada</p>
                                        <p className="body-sm text-muted-foreground max-w-sm">Escale os 5 titulares de dois clubes e jogue a primeira partida. O resultado aparece aqui e na classificação.</p>
                                        <DialogNewMatch />
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredMatches.map((match) => {
                                const homeAcronym = clubsMap.get(match.homeClubId) ?? "MND";
                                const awayAcronym = clubsMap.get(match.awayClubId) ?? "VIS";

                                return (
                                    <tr key={match.id} className="h-16 hover:bg-muted/30 transition-colors">
                                        <td className="px-6 whitespace-nowrap text-foreground body-sm">
                                            {match.formattedDate}
                                        </td>

                                        <td className="px-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <span className="body-sm-semibold text-foreground">
                                                    {match.homeClubName}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="uppercase border border-border bg-muted/60 text-muted-foreground body-sm-medium px-2 py-0.5 rounded text-[11px]">
                                                    {homeAcronym}
                                                </Badge>
                                            </div>
                                        </td>

                                        <td className="px-4 text-center whitespace-nowrap">
                                            <span className="inline-block rounded-md border border-border bg-muted/40 px-3 py-1 body-sm-semibold text-foreground">
                                                {match.homeGoals} × {match.awayGoals}
                                            </span>
                                        </td>

                                        <td className="px-4 text-left whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="uppercase border border-border bg-muted/60 text-muted-foreground body-sm-medium px-2 py-0.5 rounded text-[11px]">
                                                    {awayAcronym}
                                                </Badge>
                                                <span className="body-sm-semibold text-foreground">
                                                    {match.awayClubName}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 whitespace-nowrap">
                                            <Badge
                                                variant="outline"
                                                className="border-border bg-background text-foreground caption-xs-medium rounded-full px-3 py-1 text-xs">
                                                {getResultBadgeText(match.result)}
                                            </Badge>
                                        </td>

                                        <td className="px-6 text-right whitespace-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-foreground hover:text-foreground/80 body-sm-medium h-8">
                                                Ver duelos
                                                <ChevronRight size={16} className="ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="border-t border-border p-4 bg-card body-sm text-muted-foreground">
                {filteredMatches.length} {filteredMatches.length === 1 ? "partida" : "partidas"}
            </div>
        </div>
    );
}