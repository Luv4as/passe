import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";



export interface StandingItem {
    position: number;
    clubId: number;
    clubName: string;
    clubAcronym: string;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

interface StandingsResponse {
    position: number;
    club_id: number;
    club_name: string;
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
}

function generateAcronym(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 3) {
        return (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
}

export function useStandings() {
    const [standings, setStandings] = useState<StandingItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getStandings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchApi<StandingsResponse[]>("/standings", {
                method: "GET",
            });

            const formatted: StandingItem[] = (response || []).map((item) => ({
                position: item.position,
                clubId: item.club_id,
                clubName: item.club_name,
                clubAcronym: generateAcronym(item.club_name),
                points: item.points,
                played: item.played,
                won: item.wins,
                drawn: item.draws,
                lost: item.losses,
                goalsFor: item.goals_for,
                goalsAgainst: item.goals_against,
                goalDifference: item.goal_difference,
            }));
            setStandings(formatted);
            return true;
        } catch(error){
            const errorMessage = error instanceof Error
                ? error.message
                : "Não foi possível obter a classificação.";
            setError(errorMessage);
            return [];
        }finally {
            setLoading(false);
        }
    }, []);

    return { getStandings, standings, loading, error };
}