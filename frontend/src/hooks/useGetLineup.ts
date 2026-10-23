import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export type Formation = "3-1" | "2-2" | "2-1-1" | "1-2-1";

export interface LineupPlayer {
  id: number;
  name: string;
  position: string;
  agility: number;
  age: number;
  condition: "APTO" | "MAL_CONDICIONADO" | "DOENTE" | "SUSPENSO";
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
  clubId: number;
}

interface LineupPlayerRaw {
  id: number;
  name: string;
  position: string;
  agility: number;
  age: number;
  condition: "APTO" | "MAL_CONDICIONADO" | "DOENTE" | "SUSPENSO";
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
  club_id: number;
}

export interface LineupData {
  clubId: number;
  formation: Formation | null;
  complete: boolean;
  players: LineupPlayer[];
}

interface LineupRawResponse {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: LineupPlayerRaw[];
}

export function useGetLineup(clubId?: number | null) {
  const [lineup, setLineup] = useState<LineupData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getLineup = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchApi<LineupRawResponse>(`/clubs/${clubId}/lineup`);

      const mappedLineup: LineupData = {
        clubId: response.club_id,
        formation: response.formation,
        complete: response.complete,
        players: (response.players || []).map((p) => ({
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
          clubId: p.club_id,
        })),
      };

      setLineup(mappedLineup);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar a escalação";
      setError(errorMessage);
      setLineup(null);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  return {
    lineup,
    loading,
    error,
    getLineup,
  };
}