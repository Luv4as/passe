"use client";

import { DialogNewPlayer } from "@/src/components/dialogNewPlayer";
import PlayersTable from "@/src/components/playersTable";
import { TableFilter, type TableFilters } from "@/src/components/tableFilter";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { useEffect, useState } from "react";

export default function PlayersPage() {
  const { setHeaderAction } = useHeaderAction();
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    position: "",
    condition: undefined,
    clubId: undefined,
    minAge: undefined,
    maxAge: undefined,
    minValue: undefined,
    maxValue: undefined,
  });

const handleClearFilters = () => {
    setFilters({
      search: "",
      position: undefined,
      condition: undefined,
      clubId: undefined,
      minAge: undefined,
      maxAge: undefined,
      minValue: undefined,
      maxValue: undefined,
    });
  };

  useEffect(() => {
    setHeaderAction(<DialogNewPlayer />);
    return () => setHeaderAction(null);
  }, [setHeaderAction]);

  return (
    <div>
      <TableFilter filters={filters} onFiltersChange={setFilters} />
      <PlayersTable 
      key={JSON.stringify(filters)} 
      onClearFilters={handleClearFilters}
      filters={filters} />
    </div>
  );
}
