import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Shield, Search, Shirt, UserRound, Coins, X } from "lucide-react";
import { ComboboxFilter, } from "./comboboxFilter";
import { useEffect, useState } from "react";
import { fetchApi } from "@/src/lib/api";
import type { TableDataOptions } from "@/src/hooks/useTableData";

export type TableFilters = Pick<TableDataOptions, "search" | "position" | "condition" | "clubId" | "minAge" | "maxAge" | "minValue" | "maxValue">;

interface ClubOption {
    id: number;
    name: string;
}

interface TableFilterProps {
    filters: TableFilters;
    onFiltersChange: (filters: TableFilters) => void;
}

interface ActiveFilter {
    key: string;
    label: string;
    clear: Partial<TableFilters>;
}

function activeFilter(
    key: string,
    label: string,
    clear: Partial<TableFilters>,
): ActiveFilter {
    return { key, label, clear };
}

const ageRanges = [
    { label: "18 a 30", minAge: 18, maxAge: 30 },
    { label: "31 a 40", minAge: 31, maxAge: 40 },
    { label: "41 a 45", minAge: 41, maxAge: 45 },
];

const valueRanges = [
    { label: "10,00 a 60,00", minValue: 10, maxValue: 60 },
    { label: "60,01 a 100,00", minValue: 60.01, maxValue: 100 },
    { label: "100,01 a 200,00", minValue: 100.01, maxValue: 200 },
];

export function TableFilter({ filters, onFiltersChange }: TableFilterProps) {
    const [clubs, setClubs] = useState<ClubOption[]>([]);

    useEffect(() => {
        fetchApi<ClubOption[]>("/clubs")
            .then(setClubs)
            .catch((error) => console.error("Erro ao carregar clubes para os filtros:", error));
    }, []);

    function updateFilter(changes: Partial<TableFilters>) {
        onFiltersChange({ ...filters, ...changes });
    }

    const activeFilters: ActiveFilter[] = [];
    if (filters.search) activeFilters.push(activeFilter("search", filters.search, { search: undefined }));
    if (filters.position) activeFilters.push(activeFilter("position", filters.position, { position: undefined }));
    if (filters.condition) {
        activeFilters.push(activeFilter("condition", filters.condition.replace("_", " "), { condition: undefined }));
    }
    if (filters.clubId) {
        activeFilters.push(activeFilter(
            "clubId",
            clubs.find((club) => club.id === filters.clubId)?.name ?? String(filters.clubId),
            { clubId: undefined },
        ));
    }
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
        activeFilters.push(activeFilter("age", `${filters.minAge ?? ""} a ${filters.maxAge ?? ""}`, {
            minAge: undefined,
            maxAge: undefined,
        }));
    }
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
        activeFilters.push(activeFilter(
            "value",
            `${filters.minValue?.toFixed(2).replace(".", ",") ?? ""} a ${filters.maxValue?.toFixed(2).replace(".", ",") ?? ""}`,
            { minValue: undefined, maxValue: undefined },
        ));
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 p-2 border border-border rounded-xl">
                <InputGroup className="max-w-xs">
                    <InputGroupInput
                        value={filters.search ?? ""}
                        onChange={(event) => updateFilter({ search: event.target.value || undefined })}
                        placeholder="Buscar por nome"
                    />
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                </InputGroup>
                <ComboboxFilter
                    icon={<Shirt className="h-4 w-4" />}
                    placeholder="Posição"
                    value={filters.position}
                    onValueChange={(value) => updateFilter({ position: value || undefined })}
                    opcoes={["GOL", "ZAG", "LAT", "MEI", "ATA"]} />
                <ComboboxFilter
                    icon={<HeartPulse className="h-4 w-4" />}
                    placeholder="Condição"
                    value={filters.condition}
                    onValueChange={(value) => updateFilter({ condition: value ? value as TableDataOptions["condition"] : undefined })}
                    opcoes={["APTO", "MAL_CONDICIONADO", "DOENTE"]} />
                <ComboboxFilter
                    icon={<Shield className="h-4 w-4" />}
                    placeholder="Clube"
                    value={clubs.find((club) => club.id === filters.clubId)?.name}
                    onValueChange={(value) => updateFilter({ clubId: clubs.find((club) => club.name === value)?.id })}
                    opcoes={clubs.map((club) => club.name)} />
                <ComboboxFilter
                    icon={<UserRound className="h-4 w-4" />}
                    placeholder="Idade"
                    value={ageRanges.find((range) => range.minAge === filters.minAge && range.maxAge === filters.maxAge)?.label}
                    onValueChange={(value) => {
                        const range = ageRanges.find((item) => item.label === value);
                        updateFilter(range ? { minAge: range.minAge, maxAge: range.maxAge } : { minAge: undefined, maxAge: undefined });
                    }}
                    opcoes={ageRanges.map((range) => range.label)} />
                <ComboboxFilter
                    icon={<Coins className="h-4 w-4" />}
                    placeholder="Valor de Mercado"
                    value={valueRanges.find((range) => range.minValue === filters.minValue && range.maxValue === filters.maxValue)?.label}
                    onValueChange={(value) => {
                        const range = valueRanges.find((item) => item.label === value);
                        updateFilter(range ? { minValue: range.minValue, maxValue: range.maxValue } : { minValue: undefined, maxValue: undefined });
                    }}
                    opcoes={valueRanges.map((range) => range.label)} />
            </div>
            <div className="flex flex-row gap-2 m-6">
                <p className="body-sm text-muted-foreground">Filtros ativos:</p>
                {activeFilters.map((filter) => (
                    <Badge
                        key={filter.key}
                        variant="secondary"
                        render={
                            <button
                                type="button"
                                onClick={() => updateFilter(filter.clear)}
                            />
                        }
                        className="rounded-full px-3 py-1 text-xs font-medium"
                    >
                        {filter.label}
                        <X aria-hidden="true" />
                    </Badge>
                ))}
            </div>
        </div>
    )
}