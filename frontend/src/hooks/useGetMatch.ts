import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export interface MatchPlayer {
  playerId: number;
  playerName: string;
  position: string;
  condition: "APTO" | "MAL_CONDICIONADO" | "DOENTE";
  attribute: string;
  value: number;
}

export interface MatchDuel {
  order: number;
  attackingClubId: number;
  attacker: MatchPlayer;
  defender: MatchPlayer;
  goal: boolean;
}

export interface MatchClubSummary {
  clubId: number;
  clubName: string;
  formation: string;
  goals: number;
}

export interface MatchDetails {
  id: number;
  playedAt: string;
  home: MatchClubSummary;
  away: MatchClubSummary;
  result: "VITORIA_MANDANTE" | "VITORIA_VISITANTE" | "EMPATE";
  duels: MatchDuel[];
}

interface RawMatchPlayer {
  player_id: number;
  player_name: string;
  position: string;
  condition: "APTO" | "MAL_CONDICIONADO" | "DOENTE";
  attribute: string;
  value: number;
}

interface RawMatchDuel {
  order: number;
  attacking_club_id: number;
  attacker: RawMatchPlayer;
  defender: RawMatchPlayer;
  goal: boolean;
}

interface RawMatchClubSummary {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

interface RawMatchDetailsResponse {
  id: number;
  played_at: string;
  home: RawMatchClubSummary;
  away: RawMatchClubSummary;
  result: "VITORIA_MANDANTE" | "VITORIA_VISITANTE" | "EMPATE";
  duels: RawMatchDuel[];
}

export function useGetMatch() {
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getMatch = useCallback(async (matchId: number) => {
    if (!matchId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchApi<RawMatchDetailsResponse>(`/matches/${matchId}`);

      const mappedMatch: MatchDetails = {
        id: response.id,
        playedAt: response.played_at,
        home: {
          clubId: response.home.club_id,
          clubName: response.home.club_name,
          formation: response.home.formation,
          goals: response.home.goals,
        },
        away: {
          clubId: response.away.club_id,
          clubName: response.away.club_name,
          formation: response.away.formation,
          goals: response.away.goals,
        },
        result: response.result,
        duels: (response.duels || []).map((duel) => ({
          order: duel.order,
          attackingClubId: duel.attacking_club_id,
          attacker: {
            playerId: duel.attacker.player_id,
            playerName: duel.attacker.player_name,
            position: duel.attacker.position,
            condition: duel.attacker.condition,
            attribute: duel.attacker.attribute,
            value: duel.attacker.value,
          },
          defender: {
            playerId: duel.defender.player_id,
            playerName: duel.defender.player_name,
            position: duel.defender.position,
            condition: duel.defender.condition,
            attribute: duel.defender.attribute,
            value: duel.defender.value,
          },
          goal: duel.goal,
        })),
      };

      setMatch(mappedMatch);
      return mappedMatch;
    } catch (err: unknown) {
      let errorMessage = "Erro ao buscar os detalhes da partida.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setMatch(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    match,
    loading,
    error,
    getMatch,
  };
}