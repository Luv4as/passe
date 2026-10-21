"use client";

import { useState } from "react";
import { ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import { ClubItem } from "@/src/hooks/useGetClubs";
import { formatCoins } from "../lib/utils";
import { SortOption, SortTable } from "./sortTable";
import { IconContainer } from "@/components/ui/icon-container";
import { DialogNewClub } from "./dialogNewClub";

interface ClubsTableProps {
    clubs: ClubItem[];
    loading?: boolean;
    error?: string | null;
}

type ClubSortValue = "name" | "patrimony-desc" | "patrimony-asc";

const CLUB_SORT_OPTIONS: SortOption<ClubSortValue>[] = [
    { label: "Patrimônio (maior para o menor)", value: "patrimony-desc" },
    { label: "Patrimônio (menor para o maior)", value: "patrimony-asc" },
    { label: "Nome", value: "name" },
];

export function ClubsTable({ clubs = [], loading, error }: ClubsTableProps) {
    const [sortOption, setSortOption] = useState<ClubSortValue>("patrimony-desc");

    const sortedClubs = [...clubs].sort((a, b) => {
        const equityA = a.cash + (a.squadValue ?? 0);
        const equityB = b.cash + (b.squadValue ?? 0);

        if (sortOption === "patrimony-desc") {
            return equityB - equityA || a.name.localeCompare(b.name);
        }
        if (sortOption === "patrimony-asc") {
            return equityA - equityB || a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <section className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="body-sm-semibold text-foreground">{clubs.length} clubes</span>
                    <span className="rounded-lg bg-muted px-2 py-0.5 caption-xs-medium text-muted-foreground">
                        {clubs.length} de 20
                    </span>
                </div>

                <SortTable
                    options={CLUB_SORT_OPTIONS}
                    value={sortOption}
                    onChange={setSortOption} />
            </header>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse body-sm-medium">
                    <thead className="bg-muted text-muted-foreground">
                        <tr className="h-10 border-b border-border text-left caption-xs-medium">
                            <th className="px-4">Clube</th>
                            <th className="px-4">Sigla</th>
                            <th className="px-4 text-right">Caixa</th>
                            <th className="px-4 text-right">Valor do elenco</th>
                            <th className="px-4 text-right">Patrimônio</th>
                            <th className="px-4 text-right w-32" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="h-28 text-center text-muted-foreground">
                                    Carregando clubes...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="h-28 text-center text-destructive">
                                    {error}
                                </td>
                            </tr>
                        ) : sortedClubs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <IconContainer className="bg-muted border border-border h-12 w-12 flex items-center justify-center rounded-xl">
                                            <Shield size={24} className="text-muted-foreground" />
                                        </IconContainer>
                                        <p className="heading-card text-foreground font-semibold mt-1">Nenhum clube cadastrado</p>
                                        <p className="body-sm text-muted-foreground max-w-sm">Crie o primeiro clube com nome e sigla. Ele começa com 300,00 em caixa e sem jogadores.</p>
                                        <DialogNewClub />
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedClubs.map((club) => {
                                const equity = club.cash + (club.squadValue ?? 0);

                                return (
                                    <tr key={club.id} className="h-14 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex border border-border py-2 px-1 shrink-0 items-center justify-center rounded-lg bg-muted caption-xs-medium text-foreground">
                                                    {club.acronym}
                                                </span>
                                                <span className="body-sm-medium text-foreground">{club.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <span className="border border-border rounded-lg bg-muted px-2 py-0.5 caption-xs-medium">
                                                {club.acronym}
                                            </span>
                                        </td>
                                        <td className="px-4 text-right text-foreground body-sm">
                                            {formatCoins(club.cash)}
                                        </td>
                                        <td className="px-4 text-right text-foreground body-sm">
                                            {formatCoins(club.squadValue ?? 0)}
                                        </td>
                                        <td className="px-4 text-right text-foreground body-sm-medium">
                                            {formatCoins(equity)}
                                        </td>
                                        <td className="px-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/market/clubs/${club.id}`}
                                                className="inline-flex items-center gap-1 body-sm-semibold text-foreground hover:text-primary transition-colors">
                                                Ver clube
                                                <ChevronRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="border-t border-border px-4 py-3 caption-xs text-muted-foreground">
                Clubes pelo nome por padrão ou pelo patrimônio, do maior para o menor, com empate desfeito pelo nome.
            </footer>
        </section>
    );
}