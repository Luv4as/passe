import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

interface playerResponse {
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
  club_name?: string | null;
  club_code?: string | null;
}

interface UseGetPlayerOptions {
  onSuccess?: () => void;
}

export function useGetPlayer(options?: UseGetPlayerOptions) {
  useState<playerResponse | null>(null);
  const [playerData, setPlayerData] = useState<playerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getPlayer = useCallback(
    async (playerId: number) => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchApi<playerResponse>(`/players/${playerId}`, {
          method: "GET",
        });
        setPlayerData(data);
        options?.onSuccess?.();
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Não foi possível obter os dados do jogador.";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [options],
  );
  return { getPlayer, playerData, loading, error };
}
