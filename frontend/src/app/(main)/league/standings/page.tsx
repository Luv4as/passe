'use client'

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
        <div>
            <StandingsTable
                standings={standings}
                loading={loading}
                error={error} />
        </div>
    )
}