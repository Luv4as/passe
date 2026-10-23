import { useState } from "react";
import { fetchApi } from "../lib/api";

export interface SellTransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: string;
  value: number;
  fee: number;
  penalty: number;
  profit: number;
  cash_change: number;
  created_at: string;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}

interface UseSellPlayerOptions {
  onSuccess?: (data: SellTransactionResponse) => void;
  onError?: (error: string) => void;
}

export function useSellPlayer(options?: UseSellPlayerOptions) {
  const [error, setError] = useState<string | null>(null);
  const [selling, setSelling] = useState(false);

  async function sellPlayer(playerId: number) {
    if (!playerId) return;

    setSelling(true);
    setError(null);

    try {
      const response = await fetchApi<SellTransactionResponse>(
        `/players/${playerId}/sell`,
        {
          method: "POST",
        },
      );
      options?.onSuccess?.(response);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao vender o jogador.";
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setSelling(false);
    }
  }

  return { sellPlayer, error, selling };
}
