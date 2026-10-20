'use client'

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/src/components/dropdown";
import PlayersTable from "@/src/components/table";
import { TableFilter, type TableFilters } from "@/src/components/tableFilter";
import { useHeaderAction } from "@/src/contexts/HeaderActionContext";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function PlayersPage() {
    const { setHeaderAction } = useHeaderAction();
    const [filters, setFilters] = useState<TableFilters>({});

    useEffect(() => {
        setHeaderAction(
            <Button onClick={() => alert("Criar jogador")}>
                <Plus className="h-4 w-4" />
                Novo Jogador
            </Button>
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    return (
        <div>
            <TableFilter filters={filters} onFiltersChange={setFilters} />
            <PlayersTable key={JSON.stringify(filters)} filters={filters} />
        </div>
    )
}