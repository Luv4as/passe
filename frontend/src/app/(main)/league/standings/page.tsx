'use client'

import { StandingsCriteriaCard } from "@/src/components/cardCriteriaCard";
import { RecentMatchesCard } from "@/src/components/cardRecentMatches";
import { DialogNewMatch } from "@/src/components/dialogNewMatch";
import { StandingsTable } from "@/src/components/standingsTable";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useStandings } from "@/src/hooks/useStandings";
import { useEffect } from "react";


export default function StandingsPage() {
    const { setHeaderAction } = useHeaderAction();
    const { getStandings, standings, loading, error } = useStandings();


    useEffect(() => {
        getStandings();
    }, [getStandings]);

    useEffect(() => {
        setHeaderAction(
            <DialogNewMatch />
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);


    return (
        <div className="flex flex-row items-start gap-4">
            <StandingsTable
                standings={standings}
                loading={loading}
                error={error} />
            <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
                <RecentMatchesCard />
                <StandingsCriteriaCard />
            </div>
        </div>
    )
}