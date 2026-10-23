"use client";

import { ClubsTable } from "@/src/components/clubTable";
import { DialogNewClub } from "@/src/components/dialogNewClub";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useGetClubs } from "@/src/hooks/useGetClubs";
import { useEffect } from "react";

export default function ClubPage() {
  const { setHeaderAction } = useHeaderAction();
  const { getClubs, clubs, loading, error } = useGetClubs();

  useEffect(() => {
    getClubs();
  }, [getClubs]);

  useEffect(() => {
    setHeaderAction(<DialogNewClub />);
    return () => setHeaderAction(null);
  }, [setHeaderAction]);

  return (
    <div>
      <ClubsTable clubs={clubs} loading={loading} error={error}></ClubsTable>
    </div>
  );
}
