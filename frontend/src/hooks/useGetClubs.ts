import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "../lib/api";



export interface ClubItem {
    id: number;
    name: string;
    acronym: string;
    cash: number;
    squadValue: number;
    netWorth: number;
}

interface ClubsResponse {
    id: number;
    name: string;
    acronym: string;
    cash: number;
    squad_value: number;
    net_worth: number;
}

export function useGetClubs() {
    const [clubs, setClubs] = useState<ClubItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getClubs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchApi<ClubsResponse[]>("/clubs", {
                method: "GET",
            });

            const formatted = (data || []).map((c) => ({
                id: c.id,
                name: c.name,
                acronym: c.acronym,
                cash: c.cash,
                squadValue: c.squad_value,
                netWorth: c.net_worth,
            }));
            setClubs(formatted);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Não foi possível obter os clubes.";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { getClubs, clubs, loading, error };
}