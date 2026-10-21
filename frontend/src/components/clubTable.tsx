"use client";

import { useState } from "react";
import { ArrowDownUp, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ClubItem } from "@/src/hooks/useGetClubs";
import { formatCoins } from "../lib/utils";

interface ClubsTableProps {
    clubs: ClubItem[];
    loading?: boolean;
    error?: string | null;
}

type SortOption = "name" | "patrimony-desc" | "patrimony-asc";

export function ClubsTable({ clubs = [], loading, error }: ClubsTableProps) {
    const [sortOption, setSortOption] = useState<SortOption>("patrimony-desc");

    // Ordenação local conforme a escolha
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
            {/* Header da Tabela com Filtro/Ordenação */}
            <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="body-sm-semibold text-foreground">{clubs.length} clubes</span>
                    <span className="rounded-lg bg-muted px-2 py-0.5 caption-xs-medium text-muted-foreground">
                        {clubs.length} de 20
                    </span>
                </div>

                <div className="relative">
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="h-9 w-64 appearance-none rounded-lg border border-input bg-background pl-9 pr-8 body-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="patrimony-desc">Ordenar: patrimônio (maior para o menor)</option>
                        <option value="patrimony-asc">Ordenar: patrimônio (menor para o maior)</option>
                        <option value="name">Ordenar: Nome</option>
                    </select>
                    <ArrowDownUp size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
            </header>

            {/* Conteúdo da Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse body-sm-medium">
                    <thead className="bg-muted text-muted-foreground">
                        <tr className="h-10 border-b border-border text-left caption-xs-medium">
                            <th className="px-4">Clube</th>
                            <th className="px-4">Sigla</th>
                            <th className="px-4 text-right">Caixa</th>
                            <th className="px-4 text-right">Valor do elenco</th>
                            <th className="px-4 text-right">Patrimônio</th>
                            <th className="px-4 w-28" />
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
                                <td colSpan={6} className="h-28 text-center text-muted-foreground">
                                    Nenhum clube cadastrado.
                                </td>
                            </tr>
                        ) : (
                            sortedClubs.map((club) => {
                                const equity = club.cash + (club.squadValue ?? 0);

                                return (
                                    <tr key={club.id} className="h-14 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted caption-xs font-semibold text-foreground">
                                                    {club.acronym}
                                                </span>
                                                <span className="font-semibold text-foreground">{club.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4">
                                            <span className="rounded bg-muted px-2 py-0.5 caption-xs-medium font-semibold">
                                                {club.acronym}
                                            </span>
                                        </td>
                                        <td className="px-4 text-right text-foreground body-sm">
                                            {formatCoins(club.cash)}
                                        </td>
                                        <td className="px-4 text-right text-foreground body-sm">
                                            {formatCoins(club.squadValue ?? 0)}
                                        </td>
                                        <td className="px-4 text-right font-bold text-foreground body-sm">
                                            {formatCoins(equity)}
                                        </td>
                                        <td className="px-4 text-right">
                                            <Link
                                                href={`/market/clubs/${club.id}`}
                                                className="inline-flex items-center gap-1 body-sm-semibold text-foreground hover:text-primary transition-colors"
                                            >
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

            {/* Subtexto explicativo do footer exibido na imagem */}
            <footer className="border-t border-border px-4 py-3 caption-xs text-muted-foreground">
                Clubes pelo nome por padrão ou pelo patrimônio, do maior para o menor, com empate desfeito pelo nome.
            </footer>
        </section>
    );
}