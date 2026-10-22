import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export interface MatchClubSide {
    club_id: number;
    club_name: string;
    formation: string;
    goals: number;
}

export interface MatchResponseItem {
    id: number;
    played_at: string;
    home: MatchClubSide;
    away: MatchClubSide;
    result: "MANDANTE" | "VISITANTE" | "EMPATE";
}

export interface MatchItem {
    id: number;
    rawDate: string;
    formattedDate: string;
    homeClubId: number;
    homeClubName: string;
    homeGoals: number;
    awayClubId: number;
    awayClubName: string;
    awayGoals: number;
    result: "MANDANTE" | "VISITANTE" | "EMPATE";
}

interface UseGetMatchesOptions {
    limit?: number;
}

function formatDate(isoString: string): string {
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return isoString;
    }
}

export function useGetMatches(options?: UseGetMatchesOptions) {
    const limit = options?.limit; 

    const [matches, setMatches] = useState<MatchItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getMatches = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchApi<MatchResponseItem[]>("/matches", {
                method: "GET",
            });

            const formatted: MatchItem[] = (data || []).map((m) => ({
                id: m.id,
                rawDate: m.played_at,
                formattedDate: formatDate(m.played_at),
                homeClubId: m.home.club_id,
                homeClubName: m.home.club_name,
                homeGoals: m.home.goals,
                awayClubId: m.away.club_id,
                awayClubName: m.away.club_name,
                awayGoals: m.away.goals,
                result: m.result,
            }));

            const finalMatches = limit ? formatted.slice(0, limit) : formatted;

            setMatches(finalMatches);
            return true;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as partidas.";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [limit]);

    return { getMatches, matches, loading, error };
}