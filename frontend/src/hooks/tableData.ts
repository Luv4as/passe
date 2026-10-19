"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../lib/api";

export type PlayerCondition = "Apto" | "Mal condicionado" | "Doente";

export interface Player {
    id: number;
    initials: string;
    name: string;
    position: string;
    positionLabel: string;
    agility: number;
    age: number;
    condition: PlayerCondition;
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
    clubCode?: string;
    clubName?: string;
    avatarClass: string;
}

interface ApiPlayer {
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

interface ApiClub {
    id: number;
    name: string;
    acronym: string;
}

interface PlayersResponse {
    data: ApiPlayer[];
    meta: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    };
}

export interface TableDataOptions {
    search?: string;
    position?: string;
    condition?: "APTO" | "MAL_CONDICIONADO" | "DOENTE";
    free?: boolean;
    clubId?: number;
    minAge?: number;
    maxAge?: number;
    minValue?: number;
    maxValue?: number;
    sort?: "name" | "value_asc" | "value_desc" | "age_asc" | "age_desc" | "position";
    page?: number;
    limit?: number;
}

export interface TableDataResult {
    players: Player[];
    totalItems: number;
    totalPages: number;
    page: number;
    loading: boolean;
    error: string | null;
}

const positionLabels: Record<string, string> = {
    GOL: "Goleiro",
    ZAG: "Zagueiro",
    LAT: "Lateral",
    MEI: "Meio-campo",
    ATA: "Atacante",
};

const avatarClasses = [
    "bg-avatar-zinc text-avatar-zinc-foreground",
    "bg-avatar-pink text-avatar-pink-foreground",
    "bg-avatar-cyan text-avatar-cyan-foreground",
    "bg-avatar-teal text-avatar-teal-foreground",
    "bg-avatar-violet text-avatar-violet-foreground",
];

function normalizeCondition(condition: string): PlayerCondition {
    switch (condition.toUpperCase()) {
        case "APTO":
            return "Apto";
        case "MAL_CONDICIONADO":
            return "Mal condicionado";
        case "DOENTE":
            return "Doente";
        default:
            return "Apto";
    }
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function toPlayer(player: ApiPlayer, clubs: Map<number, ApiClub>): Player {
    const club = player.club_id === null ? undefined : clubs.get(player.club_id);

    return {
        id: player.id,
        initials: getInitials(player.name),
        name: player.name,
        position: player.position,
        positionLabel: positionLabels[player.position] ?? player.position,
        agility: player.agility,
        age: player.age,
        condition: normalizeCondition(player.condition),
        baseValue: player.base_value,
        marketValue: player.market_value,
        pace: player.pace,
        shooting: player.shooting,
        passing: player.passing,
        dribbling: player.dribbling,
        defending: player.defending,
        physical: player.physical,
        potential: player.potential,
        overall: player.overall,
        clubCode: club?.acronym,
        clubName: club?.name,
        avatarClass: avatarClasses[player.id % avatarClasses.length],
    };
}

export function useTableData(options: TableDataOptions = {}): TableDataResult {
    const [result, setResult] = useState<TableDataResult>({
        players: [],
        totalItems: 0,
        totalPages: 0,
        page: options.page ?? 1,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();

        async function loadData() {
            setResult((current) => ({ ...current, loading: true, error: null }));

            try {
                const params = new URLSearchParams();
                const values: Record<string, string | number | boolean | undefined> = {
                    search: options.search,
                    position: options.position,
                    condition: options.condition,
                    free: options.free,
                    club_id: options.clubId,
                    min_age: options.minAge,
                    max_age: options.maxAge,
                    min_value: options.minValue,
                    max_value: options.maxValue,
                    sort: options.sort ?? "name",
                    page: options.page ?? 1,
                    limit: options.limit ?? 10,
                };

                Object.entries(values).forEach(([key, value]) => {
                    if (value !== undefined && value !== "") params.set(key, String(value));
                });

                const [playersResponse, clubsResponse] = await Promise.all([
                    fetchApi<PlayersResponse>(`/players?${params.toString()}`, { signal: controller.signal }),
                    fetchApi<ApiClub[]>("/clubs", { signal: controller.signal }),
                ]);
                const clubs = new Map(clubsResponse.map((club) => [club.id, club]));

                setResult({
                    players: playersResponse.data.map((player) => toPlayer(player, clubs)),
                    totalItems: playersResponse.meta.total_items,
                    totalPages: playersResponse.meta.total_pages,
                    page: playersResponse.meta.page,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Erro ao carregar dados da tabela de jogadores:", error);
                setResult((current) => ({
                    ...current,
                    loading: false,
                    error: error instanceof Error ? error.message : "Não foi possível carregar os jogadores.",
                }));
            }
        }

        void loadData();
        return () => controller.abort();
    }, [
        options.clubId,
        options.condition,
        options.free,
        options.limit,
        options.maxAge,
        options.maxValue,
        options.minAge,
        options.minValue,
        options.page,
        options.position,
        options.search,
        options.sort,
    ]);

    return result;
}

export const TableData = useTableData;
