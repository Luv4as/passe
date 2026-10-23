"use client";

import { Goal, HeartPulseIcon } from "lucide-react";
import { MatchDetails, MatchPlayer } from "../hooks/useGetMatch";
import { getPlayerInitials, translateAttribute } from "../lib/utils";

interface MatchFieldSectionProps {
    match: MatchDetails;
}

interface PlayerWithStats {
    player: MatchPlayer;
    scoredGoal: boolean;
    usedAttributeName: string;
    usedAttributeValue: number;
}

export function MatchFieldSection({ match }: MatchFieldSectionProps) {

    const getTeamPlayersWithStats = (clubId: number): PlayerWithStats[] => {
        const list: PlayerWithStats[] = [];
        const seenIds = new Set<number>();

        match.duels.forEach((duel) => {
            if (duel.attackingClubId === clubId) {
                if (!seenIds.has(duel.attacker.playerId)) {
                    seenIds.add(duel.attacker.playerId);
                    list.push({
                        player: duel.attacker,
                        scoredGoal: duel.goal,
                        usedAttributeName: duel.attacker.attribute,
                        usedAttributeValue: duel.attacker.value,
                    });
                }
            } else {
                if (!seenIds.has(duel.defender.playerId)) {
                    seenIds.add(duel.defender.playerId);
                    list.push({
                        player: duel.defender,
                        scoredGoal: false,
                        usedAttributeName: duel.defender.attribute,
                        usedAttributeValue: duel.defender.value,
                    });
                }
            }
        });

        return list;
    };

    const homePlayers = getTeamPlayersWithStats(match.home.clubId);
    const awayPlayers = getTeamPlayersWithStats(match.away.clubId);


    const getHomeCoordinates = (index: number, formation: string) => {
        if (index === 0) return { top: "50%", left: "8%" };

        switch (formation) {
            case "3-1":
                if (index === 1) return { top: "25%", left: "22%" };
                if (index === 2) return { top: "50%", left: "22%" };
                if (index === 3) return { top: "75%", left: "22%" };
                return { top: "50%", left: "42%" }; // Ataque

            case "2-2":
                if (index === 1) return { top: "32%", left: "20%" };
                if (index === 2) return { top: "68%", left: "20%" };
                if (index === 3) return { top: "32%", left: "38%" };
                return { top: "68%", left: "38%" };

            case "1-2-1":
                if (index === 1) return { top: "50%", left: "18%" };
                if (index === 2) return { top: "32%", left: "32%" };
                if (index === 3) return { top: "68%", left: "32%" };
                return { top: "50%", left: "42%" };

            case "2-1-1":
            default:
                if (index === 1) return { top: "30%", left: "20%" };
                if (index === 2) return { top: "72%", left: "20%" };
                if (index === 3) return { top: "50%", left: "32%" };
                return { top: "50%", left: "42%" };
        }
    };

    const getAwayCoordinates = (index: number, formation: string) => {
        if (index === 0) return { top: "50%", left: "92%" };

        switch (formation) {
            case "3-1":
                if (index === 1) return { top: "25%", left: "78%" };
                if (index === 2) return { top: "50%", left: "78%" };
                if (index === 3) return { top: "75%", left: "78%" };
                return { top: "50%", left: "58%" };

            case "2-2":
                if (index === 1) return { top: "32%", left: "80%" };
                if (index === 2) return { top: "68%", left: "80%" };
                if (index === 3) return { top: "32%", left: "62%" };
                return { top: "68%", left: "62%" };

            case "1-2-1":
                if (index === 1) return { top: "50%", left: "82%" };
                if (index === 2) return { top: "32%", left: "68%" };
                if (index === 3) return { top: "68%", left: "68%" };
                return { top: "50%", left: "58%" };

            case "2-1-1":
            default:
                if (index === 1) return { top: "30%", left: "80%" };
                if (index === 2) return { top: "72%", left: "80%" };
                if (index === 3) return { top: "50%", left: "68%" };
                return { top: "50%", left: "58%" };
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="heading-card text-foreground">Em campo</h3>
                    <p className="caption-xs text-muted-foreground">
                        Titulares de cada clube na formação da partida e os valores usados nos duelos, já com o efeito da condição.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="flex size-4 items-center justify-center rounded-full bg-warning text-[9px] text-white font-bold">
                            <HeartPulseIcon size={10} />
                        </span>
                        Mal condicionado
                    </span>
                    <span className="flex items-center gap-1">
                        <Goal size={12} />
                        Gol no duelo
                    </span>
                </div>
            </div>

            <div className="relative h-96 w-full overflow-hidden rounded-xl border border-emerald-800 bg-emerald-900 shadow-inner">
                <div className="absolute inset-y-0 left-1/2 w-0.5 border-r border-dashed border-emerald-700/60 -translate-x-1/2" />
                <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700/60" />
                <div className="absolute left-0 top-1/2 h-44 w-20 -translate-y-1/2 border-r border-y border-emerald-700/60 rounded-r-lg" />
                <div className="absolute right-0 top-1/2 h-44 w-20 -translate-y-1/2 border-l border-y border-emerald-700/60 rounded-l-lg" />

                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 caption-xs text-white backdrop-blur-xs border border-white/10">
                    <span className="size-2.5 rounded-full bg-blue-500" />
                    <span className="font-semibold">{match.home.clubName}</span>
                    <span className="text-emerald-200">{match.home.formation}</span>
                    <span className="text-white/60">| ataca ➔</span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 caption-xs text-white backdrop-blur-xs border border-white/10">
                    <span className="text-white/60">⬅ ataca |</span>
                    <span className="font-semibold">{match.away.clubName}</span>
                    <span className="text-emerald-200">{match.away.formation}</span>
                    <span className="size-2.5 rounded-full bg-white" />
                </div>

                {homePlayers.map((item, idx) => {
                    const coords = getHomeCoordinates(idx, match.home.formation);
                    return (
                        <PlayerBadge
                            key={`home-${item.player.playerId}`}
                            item={item}
                            coords={coords}
                            bgColor="bg-primary text-primary-foreground border-background"
                        />
                    );
                })}

                {awayPlayers.map((item, idx) => {
                    const coords = getAwayCoordinates(idx, match.away.formation);
                    return (
                        <PlayerBadge
                            key={`away-${item.player.playerId}`}
                            item={item}
                            coords={coords}
                            bgColor="bg-background text-foreground border-background"
                        />
                    );
                })}
            </div>
        </div>
    );
}

function PlayerBadge({
    item,
    coords,
    bgColor,
}: {
    item: PlayerWithStats;
    coords: { top: string; left: string };
    bgColor: string;
}) {
    const { player, scoredGoal, usedAttributeName, usedAttributeValue } = item;

    return (
        <div
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
            style={{ top: coords.top, left: coords.left }}>
            <div className="relative flex items-center justify-center">
                <div
                    className={`relative flex size-9 items-center justify-center rounded-full text-xs font-bold shadow-md border-2 ${bgColor}`}
                >
                    {getPlayerInitials(player.playerName)}

                    {player.condition === "MAL_CONDICIONADO" && (
                        <span className="absolute -top-1 -left-1 flex size-4 items-center justify-center rounded-full bg-warning text-[10px] text-white font-bold border border-black/40">
                            <HeartPulseIcon size={10} />
                        </span>
                    )}

                    {scoredGoal && (
                        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-background text-[10px] backdrop-blur-xs">
                            <Goal size={10} className="text-foreground" />
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-1 flex flex-col items-center rounded bg-black/70 px-2 py-0.5 text-center text-white backdrop-blur-xs min-w-20">
                <span className="text-[11px] font-semibold truncate max-w-24">
                    {player.playerName.split(" ")[0]}
                </span>
                <span className="text-[9px] text-emerald-200">
                    {player.position} · {translateAttribute(usedAttributeName).slice(0, 3)} {usedAttributeValue}
                </span>
            </div>
        </div>
    );
}