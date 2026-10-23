"use client";

import { use, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetMatch } from "@/src/hooks/useGetMatch";
import { CardMatchHeader } from "@/src/components/cardMatchHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetClubs } from "@/src/hooks/useGetClubs";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { MatchFieldSection } from "@/src/components/matchFieldSection";
import { DuelTable } from "@/src/components/duelTable";

interface MatchPageProps {
    params: Promise<{ id: string }>;
}

function MatchContent({ params }: MatchPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const matchId = Number(id);

    const { match, loading, error, getMatch } = useGetMatch();
    const { clubs, getClubs } = useGetClubs();

    const { setHideHeader, setCustomTitle } = useHeaderAction();

    useEffect(() => {
        setHideHeader(true);
        return () => {
            setHideHeader(false);
            setCustomTitle(null);
        };
    }, [setHideHeader, setCustomTitle]);

    useEffect(() => {
        if (match) {
            setCustomTitle(`${match.home.clubName} ${match.home.goals} × ${match.away.goals} ${match.away.clubName}`);
        }
    }, [match, setCustomTitle]);

    useEffect(() => {
        if (matchId) void getMatch(matchId);
        void getClubs();
    }, [matchId, getMatch, getClubs]);

    const clubsMap = useMemo(() => {
        const map = new Map<number, string>();
        clubs.forEach((c) => map.set(c.id, c.acronym));
        return map;
    }, [clubs]);

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
                Carregando duelo...
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="py-12 text-center text-destructive">
                {error || "Duelo não encontrado."}
            </div>
        );
    }

    const homeAcronym = clubsMap.get(match.home.clubId) || "MAN";
    const awayAcronym = clubsMap.get(match.away.clubId) || "VIS";

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
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

            <CardMatchHeader
                match={match}
                homeAcronym={homeAcronym}
                awayAcronym={awayAcronym}
            />

            <MatchFieldSection match={match} />
            <DuelTable
                match={match}
                homeAcronym={homeAcronym}
                awayAcronym={awayAcronym}
                homeDuels={homeDuels}
                awayDuels={awayDuels}
            />
        </div>
    );
}

export default function MatchDetailsPage(props: MatchPageProps) {
    return (
        <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando...</div>}>
            <MatchContent {...props} />
        </Suspense>
    );
}