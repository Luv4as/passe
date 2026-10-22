import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export interface PlayerItem {
    id: number;
    name: string;
    position: string;
    agility: number;
    age: number;
    condition: string;
    baseValue: number;
    marketValue: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    potential: number;
    overall: number;
    clubId: number | null;
}

interface PlayersRaw {
    id: number;
    name: string;
    position: string;
    agility: number;
    age: number;
    condition: string;
    base_value: number;
    market_value: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    potential: number;
    overall: number;
    club_id: number | null;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
}

interface PlayersPaginatedResponse {
    data: PlayersRaw[];
    meta?: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    }
}

interface GetPlayersParams {
    page?: number;
    limit?: number;
    clubId?: number | null;
}
export function useGetPlayers() {
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>({
        page: 1,
        limit: 10,
        total_items: 0,
        total_pages: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getPlayers = useCallback(async (params?: GetPlayersParams) => {
        setLoading(true);
        setError(null);

        try {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append("page", params.page.toString());
            if (params?.limit) searchParams.append("limit", params.limit.toString());
            if (params?.clubId !== undefined && params?.clubId !== null) searchParams.append("club_id", params.clubId?.toString() ?? "");

            const queryString = searchParams.toString();
            const endpoint = `/players${queryString ? `?${queryString}` : ""}`;

            const response = await fetchApi<PlayersPaginatedResponse>(endpoint, {
                method: "GET",
            });

            const rawList: PlayersRaw[] = Array.isArray(response)
                ? response
                : response?.data ?? [];

            if(!Array.isArray(response) && response?.meta) {
                setMeta({
                    page: response.meta.page,
                    limit: response.meta.limit,
                    total_items: response.meta.total_items,
                    total_pages: response.meta.total_pages,
                });
            }else {
                setMeta({
                    page: 1,
                    limit: rawList.length,
                    total_items: rawList.length,
                    total_pages: 1,
                })
            }

            const formatted: PlayerItem[] = rawList.map((p) => ({
                id: p.id,
                name: p.name,
                position: p.position,
                agility: p.agility,
                age: p.age,
                condition: p.condition,
                baseValue: p.base_value,
                marketValue: p.market_value,
                pace: p.pace,
                shooting: p.shooting,
                passing: p.passing,
                dribbling: p.dribbling,
                defending: p.defending,
                physical: p.physical,
                potential: p.potential,
                overall: p.overall,
                clubId: p.club_id ?? null,
            }));
            setPlayers(formatted);
            return formatted;
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Não foi possível obter os jogadores.";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { getPlayers, players, meta, loading, error };
}