"use client"

import { Goal } from "lucide-react";
import { getPlayerAvatarClass, getPlayerInitials, translateAttribute } from "../lib/utils";
import { MatchDetails, MatchDuel } from "../hooks/useGetMatch";

interface DuelTableProps {
    match: MatchDetails;
    homeAcronym: string;
    awayAcronym: string;
    homeDuels: MatchDuel[];
    awayDuels: MatchDuel[];
}

export function DuelTable({ match, homeAcronym, awayAcronym, homeDuels, awayDuels }: DuelTableProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
            <div>
                <h3 className="heading-card text-foreground">Duelos</h3>
                <p className="caption-xs text-muted-foreground">
                    Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de linha vão do 1º (o mais recuado) ao 4º (o mais avançado), pela ordem do elenco: o 4º ataca o goleiro, o 3º ataca o 1º e o 2º ataca o 2º.
                </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left caption-xs border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                            <th className="py-2.5 px-3">Duelo</th>
                            <th className="py-2.5 px-3">Atacante</th>
                            <th className="py-2.5 px-3">Ataque</th>
                            <th className="py-2.5 px-3">Defensor</th>
                            <th className="py-2.5 px-3">Defesa</th>
                            <th className="py-2.5 px-3 text-right">Resultado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {/* ATAQUES MANDANTE */}
                        <tr className="bg-muted/20 font-semibold text-foreground">
                            <td colSpan={5} className="py-2 px-3">
                                {homeAcronym} — Ataques do {match.home.clubName} (mandante)
                            </td>
                            <td className="py-2 px-3 text-right text-muted-foreground">
                                {match.home.goals} gols
                            </td>
                        </tr>
                        {homeDuels.map((duel) => (
                            <DuelRow key={duel.order} duel={duel} />
                        ))}

                        {/* ATAQUES VISITANTE */}
                        <tr className="bg-muted/20 font-semibold text-foreground">
                            <td colSpan={5} className="py-2 px-3">
                                {awayAcronym} — Ataques do {match.away.clubName} (visitante)
                            </td>
                            <td className="py-2 px-3 text-right text-muted-foreground">
                                {match.away.goals} gols
                            </td>
                        </tr>
                        {awayDuels.map((duel) => (
                            <DuelRow key={duel.order} duel={duel} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DuelRow({ duel }: { duel: MatchDuel }) {
    const attackerColorClass = getPlayerAvatarClass?.(duel.attacker.playerName);
    const defenderColorClass = getPlayerAvatarClass?.(duel.defender.playerName);

    return (
        <tr className="hover:bg-muted/10 transition-colors">
            <td className="py-3 px-3 font-medium text-foreground">
                <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-lg border border-border bg-muted px-1.5 caption-xs-medium text-foreground">
                    {duel.order}
                </span>
            </td>

            {/* Atacante */}
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                    <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${attackerColorClass}`}>
                        {getPlayerInitials(duel.attacker.playerName)}
                    </div>
                    <div className="flex flex-col">
                        <span className="body-sm-medium text-foreground">{duel.attacker.playerName}</span>
                        <span className="caption-xs text-muted-foreground">{duel.attacker.position}</span>
                    </div>
                </div>
            </td>

            {/* Atributo Atq */}
            <td className="flex flex-row py-3 px-3 body-sm gap-2 text-muted-foreground">
                {translateAttribute(duel.attacker.attribute)}
                <span className="body-sm-semibold text-foreground">
                    {duel.attacker.value}
                </span>
            </td>

            {/* Defensor */}
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                    <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${defenderColorClass}`}>
                        {getPlayerInitials(duel.defender.playerName)}
                    </div>
                    <div className="flex flex-col">
                        <span className="body-sm-medium text-foreground">{duel.defender.playerName}</span>
                        <span className="caption-xs text-muted-foreground">{duel.defender.position}</span>
                    </div>
                </div>
            </td>

            {/* Atributo Def */}
            <td className="flex flex-row py-3 px-3 body-sm gap-2 text-muted-foreground">
                {translateAttribute(duel.defender.attribute)}
                <span className="body-sm-semibold text-foreground">
                    {duel.defender.value}
                </span>
            </td>

            {/* Status resultado */}
            <td className="py-3 px-3 text-right">
                {duel.goal ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 caption-xs-medium text-success-soft-foreground border border-success-soft-border">
                        <Goal size={12} />
                        Gol
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 caption-xs-medium text-muted-foreground border border-border">
                        Sem gol
                    </span>
                )}
            </td>
        </tr>
    );
}