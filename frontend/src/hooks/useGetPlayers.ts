import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export type PlayerCondition = "Apto" | "Mal condicionado" | "Doente";

export interface PlayerItem {
  id: number;
  name: string;
  position: string;
  positionLabel: string;
  initials: string;
  avatarClass: string;
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
  clubId: number | null;
  clubCode?: string;
  clubName?: string;
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
  };
}

export interface GetPlayersParams {
  page?: number;
  limit?: number;
  clubId?: number | null;
  search?: string;
  position?: string;
  condition?: string;
  free?: boolean;
  minAge?: number;
  maxAge?: number;
  minValue?: number;
  maxValue?: number;
  sort?: string;
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
      const values: Record<
        string,
        string | number | boolean | null | undefined
      > = {
        page: params?.page,
        limit: params?.limit,
        club_id: params?.clubId,
        search: params?.search,
        position: params?.position,
        condition: params?.condition,
        free: params?.free,
        min_age: params?.minAge,
        max_age: params?.maxAge,
        min_value: params?.minValue,
        max_value: params?.maxValue,
        sort: params?.sort,
      };
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const endpoint = `/players${queryString ? `?${queryString}` : ""}`;

      const response = await fetchApi<PlayersPaginatedResponse>(endpoint, {
        method: "GET",
      });

      const rawList: PlayersRaw[] = Array.isArray(response)
        ? response
        : (response?.data ?? []);

      if (!Array.isArray(response) && response?.meta) {
        setMeta({
          page: response.meta.page,
          limit: response.meta.limit,
          total_items: response.meta.total_items,
          total_pages: response.meta.total_pages,
        });
      } else {
        setMeta({
          page: 1,
          limit: rawList.length,
          total_items: rawList.length,
          total_pages: 1,
        });
      }

      const formatted: PlayerItem[] = rawList.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        positionLabel: positionLabels[p.position] ?? p.position,
        initials: getInitials(p.name),
        avatarClass: avatarClasses[p.id % avatarClasses.length],
        agility: p.agility,
        age: p.age,
        condition: normalizeCondition(p.condition),
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
      const errorMessage =
        error instanceof Error
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
