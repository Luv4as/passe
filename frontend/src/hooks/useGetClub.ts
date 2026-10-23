import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export interface ClubPlayerContract {
  purchaseValue: number;
  loyaltyUntil: string;
  remainingDays: number;
  penaltyRate: number;
}

export interface ClubPlayerItem {
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
  clubId: number;
  contract: ClubPlayerContract;
}

export interface ClubDetail {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squadValue: number;
  netWorth: number;
  players: ClubPlayerItem[];
}

interface RawPlayerContractResponse {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

interface RawClubPlayerResponse {
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
  club_id: number;
  contract: RawPlayerContractResponse;
}

export interface RawClubDetailResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
  players?: RawClubPlayerResponse[];
}

export function useGetClub(clubId?: number) {
  const [club, setClub] = useState<ClubDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getClub = useCallback(
    async (overrideId?: number) => {
      const idToFetch = overrideId ?? clubId;
      if (!idToFetch) return null;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchApi<RawClubDetailResponse>(
          `/clubs/${idToFetch}`,
          {
            method: "GET",
          },
        );

        const formatted: ClubDetail = {
          id: data.id,
          name: data.name,
          acronym: data.acronym,
          cash: data.cash,
          squadValue: data.squad_value,
          netWorth: data.net_worth,
          players: (data.players || []).map((p) => ({
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
            contract: {
              purchaseValue: p.contract?.purchase_value ?? 0,
              loyaltyUntil: p.contract?.loyalty_until ?? "",
              remainingDays: p.contract?.remaining_days ?? 0,
              penaltyRate: p.contract?.penalty_rate ?? 0,
            },
          })),
        };

        setClub(formatted);
        return formatted;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Não foi possível obter os detalhes do clube.";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [clubId],
  );

  return { getClub, club, loading, error };
}
