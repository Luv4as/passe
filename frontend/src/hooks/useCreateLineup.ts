import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";
import { Formation, LineupData, LineupPlayer } from "./useGetLineup";

export interface SaveLineupPayload {
  formation: Formation;
  player_ids: number[];
}

interface LineupPlayerRaw {
  id: number;
  name: string;
  position: string;
  agility: number;
  age: number;
  condition: "APTO" | "MAL_CONDICIONADO" | "DOENTE" ;
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

interface LineupRawResponse {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: LineupPlayerRaw[];
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

interface UsecreateLineupOptions {
  onSuccess?: (data: LineupData) => void;
  onError?: (error: string) => void;
}

export function useCreateLineup(options?: UsecreateLineupOptions) {
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveLineup = useCallback(
    async (clubId: number, payload: SaveLineupPayload) => {
      if (!clubId) return null;

      setSaving(true);
      setError(null);

      try {
        const response = await fetchApi<LineupRawResponse>(`/clubs/${clubId}/lineup`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const mappedData: LineupData = {
          clubId: response.club_id,
          formation: response.formation,
          complete: response.complete,
          players: (response.players || []).map((p): LineupPlayer => ({
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

        options?.onSuccess?.(mappedData);
        return mappedData;
      } catch (err: unknown) {
        let errorMessage = "Erro ao salvar a escalação.";

        if (typeof err === "object" && err !== null) {
          const apiErr = err as ApiErrorResponse;
          if (Array.isArray(apiErr.message) && apiErr.message.length > 0) {
            errorMessage = apiErr.message[0];
          } else if (typeof apiErr.message === "string") {
            errorMessage = apiErr.message;
          } else if (err instanceof Error) {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [options]
  );

  return {
    saveLineup,
    saving,
    error,
  };
}