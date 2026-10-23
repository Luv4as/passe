"use client";

import { CardLastMatch } from "@/src/components/cardLastMatch";
import { DialogNewMatch } from "@/src/components/dialogNewMatch";
import { MatchesTable } from "@/src/components/matchesTable";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useEffect } from "react";

export default function MatchesPage() {
  const { setHeaderAction } = useHeaderAction();

  useEffect(() => {
    setHeaderAction(<DialogNewMatch />);
    return () => setHeaderAction(null);
  }, [setHeaderAction]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="body-sm-medium text-muted-foreground">Ultimas partidas</p>
        <CardLastMatch />
      </div>
      <MatchesTable />
      <p className="body-sm text-muted-foreground">
        Partidas da mais recente para a mais antiga, com filtro por clube. “Ver
        duelos” abre a partida.
      </p>
    </div>
  );
}
