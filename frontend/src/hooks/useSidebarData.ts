"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../lib/api";

export interface ApiClub {
  id: number | string;
  name?: string;
  nome?: string;
}

export interface ClubSummary {
  id: number | string;
  name: string;
  nome: string;
}

export interface MatchClub {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

export interface MatchSummary {
  id: number;
  played_at: string;
  home: MatchClub;
  away: MatchClub;
  result: "MANDANTE" | "VISITANTE" | "EMPATE";
}

export interface PlayersApiResponse {
  data?: unknown[];
  meta?: {
    total_items?: number;
  };
  total?: number;
}

export interface SidebarData {
  playersCount: number;
  clubsCount: number;
  matchesCount: number;
  clubs: ClubSummary[];
  lastMatchDate?: string;
  lastLeagueMatch?: string;
  latestMatch?: MatchSummary;
  loading: boolean;
}

export function useSidebarData(): SidebarData {
  const [data, setData] = useState<{
    playersCount: number;
    clubsCount: number;
    matchesCount: number;
    clubs: ClubSummary[];
    lastMatchDate?: string;
    lastLeagueMatch?: string;
    latestMatch?: MatchSummary;
  }>({
    playersCount: 0,
    clubsCount: 0,
    matchesCount: 0,
    clubs: [],
    lastMatchDate: undefined,
    lastLeagueMatch: undefined,
    latestMatch: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [playersRes, clubsRes, matchesRes] = await Promise.all([
          fetchApi<PlayersApiResponse>("/players").catch((): PlayersApiResponse => ({
            meta: { total_items: 0 },
            total: 0,
            data: [],
          })),
          fetchApi<ApiClub[] | { data: ApiClub[] }>("/clubs").catch((): ApiClub[] => []),
          fetchApi<MatchSummary[]>("/matches").catch((): MatchSummary[] => []),
        ]);

        const playersCount =
          playersRes?.meta?.total_items ??
          playersRes?.total ??
          (Array.isArray(playersRes?.data) ? playersRes.data.length : 0);

        const rawClubs: ApiClub[] = Array.isArray(clubsRes)
          ? clubsRes
          : clubsRes.data || [];

        const clubsCount = rawClubs.length;
        const clubsList: ClubSummary[] = rawClubs.map((club: ApiClub) => ({
          id: club.id,
          name: club.name || club.nome || "",
          nome: club.nome || club.name || "",
        }));

        const matchesList: MatchSummary[] = Array.isArray(matchesRes) ? matchesRes : [];
        const matchesCount = matchesList.length;

        const latestMatch =
          matchesList.length > 0
            ? matchesList.reduce((latest, current) => {
                return new Date(current.played_at).getTime() > new Date(latest.played_at).getTime()
                  ? current
                  : latest;
              }, matchesList[0])
            : undefined;

        const lastMatchDate = latestMatch?.played_at;
        const lastLeagueMatch = latestMatch
          ? `${latestMatch.home.club_name} ${latestMatch.home.goals} × ${latestMatch.away.goals} ${latestMatch.away.club_name}`
          : undefined;

        setData({
          playersCount,
          clubsCount,
          matchesCount,
          clubs: clubsList,
          lastMatchDate,
          lastLeagueMatch,
          latestMatch,
        });
      } catch (err) {
        console.error("Erro ao carregar dados da Sidebar:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { ...data, loading };
}