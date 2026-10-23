"use client";

import { use, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetMatch, MatchDuel } from "@/src/hooks/useGetMatch";
import { CardMatchHeader } from "@/src/components/cardMatchHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPlayerInitials } from "@/src/lib/utils";
import { useGetClubs } from "@/src/hooks/useGetClubs";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";

interface MatchPageProps {
    params: Promise<{ id: string }>;
}

function MatchContent({ params }: MatchPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const matchId = Number(id);

    const { match, loading, error, getMatch } = useGetMatch();
    const { clubs, getClubs } = useGetClubs();

    const { setHideHeader } = useHeaderAction();

    useEffect(() => {
        setHideHeader(true);
        return () => {
            setHideHeader(false);
        };
    }, [setHideHeader]);

    useEffect(() => {
        if (matchId) void getMatch(matchId);
        void getClubs();
    }, [matchId, getMatch, getClubs]);

    const clubsMap = useMemo(() => {
        const map = new Map<number, string>();
        clubs.forEach((c) => map.set(c.id, c.acronym));
        return map;
    }, [clubs]);

    // Separação dos duelos por ataques de cada time
    const homeDuels = useMemo(
        () => match?.duels.filter((d) => d.attackingClubId === match.home.clubId) || [],
        [match]
    );

    const awayDuels = useMemo(
        () => match?.duels.filter((d) => d.attackingClubId === match.away.clubId) || [],
        [match]
    );

    if (loading) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Carregando partida...
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="py-12 text-center text-destructive">
                {error || "Partida não encontrada."}
            </div>
        );
    }

    const homeAcronym = clubsMap.get(match.home.clubId) || "MAN";
    const awayAcronym = clubsMap.get(match.away.clubId) || "VIS";

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
            {/* Botão de Voltar */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/league/matches")}
                    className="text-muted-foreground hover:text-foreground pl-0"
                >
                    <ArrowLeft size={16} className="mr-1.5" />
                    Voltar para partidas
                </Button>
            </div>

            {/* Card do Placar (CardLastMatch Dinâmico) */}
            <CardMatchHeader
                match={match}
                homeAcronym={homeAcronym}
                awayAcronym={awayAcronym}
            />

            {/* SEÇÃO: EM CAMPO */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="heading-card text-foreground">Em campo</h3>
                        <p className="caption-xs text-muted-foreground">
                            Titulares de cada clube na formação da partida e os valores usados nos duelos.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="size-2 rounded-full bg-amber-500" /> Mal condicionado
                        </span>
                        <span className="flex items-center gap-1">
                            ⚽ Gol no duelo
                        </span>
                    </div>
                </div>

                {/* Retângulo do Campo de Futebol */}
                <div className="relative h-96 w-full overflow-hidden rounded-xl border border-emerald-800 bg-emerald-950 p-4 shadow-inner">
                    <div className="absolute inset-y-0 left-1/2 w-0.5 border-r border-dashed border-emerald-700/60 -translate-x-1/2" />
                    <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700/60" />

                    {/* Tag Mandante */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded bg-black/50 px-2 py-1 caption-xs text-white backdrop-blur-xs">
                        <span className="size-2 rounded-full bg-blue-500" />
                        {match.home.clubName} {match.home.formation} | ataca ➔
                    </div>

                    {/* Tag Visitante */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 rounded bg-black/50 px-2 py-1 caption-xs text-white backdrop-blur-xs">
                        {match.away.clubName} {match.away.formation} | ataca ⬅
                        <span className="size-2 rounded-full bg-white" />
                    </div>

                    {/* Renderização representativa do confronto */}
                    <div className="absolute inset-0 flex items-center justify-around px-8">
                        <div className="caption-xs text-emerald-200/60 italic text-center">
                            Campo tático dos 10 jogadores em duelo
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO: DUELOS DA PARTIDA */}
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
                <div>
                    <h3 className="heading-card text-foreground">Duelos</h3>
                    <p className="caption-xs text-muted-foreground">
                        Ordem dos confrontos diretos entre atacantes e defensores durante a partida.
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
        </div>
    );
}

function DuelRow({ duel }: { duel: MatchDuel }) {
    return (
        <tr className="hover:bg-muted/10 transition-colors">
            <td className="py-3 px-3 font-medium text-foreground">#{duel.order}</td>

            {/* Atacante */}
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {getPlayerInitials(duel.attacker.playerName)}
                    </div>
                    <div className="flex flex-col">
                        <span className="body-sm-medium text-foreground">{duel.attacker.playerName}</span>
                        <span className="caption-xs text-muted-foreground">{duel.attacker.position}</span>
                    </div>
                </div>
            </td>

            {/* Atributo Atq */}
            <td className="py-3 px-3 font-semibold text-foreground">
                {duel.attacker.attribute} <span className="text-primary">{duel.attacker.value}</span>
            </td>

            {/* Defensor */}
            <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                        {getPlayerInitials(duel.defender.playerName)}
                    </div>
                    <div className="flex flex-col">
                        <span className="body-sm-medium text-foreground">{duel.defender.playerName}</span>
                        <span className="caption-xs text-muted-foreground">{duel.defender.position}</span>
                    </div>
                </div>
            </td>

            {/* Atributo Def */}
            <td className="py-3 px-3 font-semibold text-foreground">
                {duel.defender.attribute} <span className="text-muted-foreground">{duel.defender.value}</span>
            </td>

            {/* Status resultado */}
            <td className="py-3 px-3 text-right">
                {duel.goal ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 caption-xs-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        ⚽ Gol
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 caption-xs-medium text-muted-foreground border border-border">
                        Sem gol
                    </span>
                )}
            </td>
        </tr>
    );
}

export default function MatchDetailsPage(props: MatchPageProps) {
    return (
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando...</div>}>
            <MatchContent {...props} />
        </Suspense>
    );
}