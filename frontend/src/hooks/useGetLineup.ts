import { useState, useEffect } from "react";
import { fetchApi } from "../lib/api";

interface LineupResponse {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: Array<{ id: number; name: string }>;
}

export function useGetLineup(clubId?: number | null) {
  const [lineup, setLineup] = useState<LineupResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!clubId) return;

    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) setLoading(true);
    });

    fetchApi<LineupResponse>(`/clubs/${clubId}/lineup`)
      .then((data) => {
        if (isMounted) setLineup(data);
      })
      .catch(() => {
        if (isMounted) setLineup(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clubId]);

  return {
    lineup: clubId ? lineup : null,
    loading: clubId ? loading : false,
  };
}
