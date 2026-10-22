"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { IconContainer } from "@/components/ui/icon-container";
import { StandingItem } from "../hooks/useStandings";

interface StandingsTableProps {
    standings: StandingItem[];
    loading?: boolean;
    error?: string | null;
}

export function StandingsTable({ standings = [], loading, error }: StandingsTableProps) {
    return (
        <section className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse body-sm-medium">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr className="h-10 border-b border-border text-center caption-xs-medium">
                            <th className="w-12 px-3 text-center">#</th>
                            <th className="px-4 text-left">Clube</th>
                            <th className="w-12 px-2">J</th>
                            <th className="w-12 px-2">V</th>
                            <th className="w-12 px-2">E</th>
                            <th className="w-12 px-2">D</th>
                            <th className="w-12 px-2">GP</th>
                            <th className="w-12 px-2">GC</th>
                            <th className="w-14 px-2">SG</th>
                            <th className="w-14 px-4 font-bold text-foreground">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} className="h-28 text-center text-muted-foreground">
                                    Carregando classificação...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={10} className="h-28 text-center text-destructive">
                                    {error}
                                </td>
                            </tr>
                        ) : standings.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <IconContainer className="bg-muted border border-border h-12 w-12 flex items-center justify-center rounded-xl">
                                            <Shield size={24} className="text-muted-foreground" />
                                        </IconContainer>
                                        <p className="heading-card text-foreground font-semibold mt-1">
                                            Nenhum clube na classificação
                                        </p>
                                        <p className="body-sm text-muted-foreground max-w-sm">
                                            Ainda não há jogos registrados nesta liga para gerar a tabela.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            standings.map((item) => {
                                const isLeader = item.position === 1;

                                return (
                                    <tr
                                        key={item.clubId}
                                        className="h-14 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                                    >
                                        {/* Posição (#) com destaque para o 1º lugar */}
                                        <td className="px-3 text-center">
                                            <span
                                                className={`inline-flex size-6 items-center justify-center rounded-md body-sm-semibold ${
                                                    isLeader
                                                        ? "bg-primary text-primary-foreground font-bold"
                                                        : "bg-muted text-foreground"
                                                }`}
                                            >
                                                {item.position}
                                            </span>
                                        </td>

                                        {/* Clube (Sigla + Nome com Link) */}
                                        <td className="px-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex border border-border py-1 px-1.5 shrink-0 items-center justify-center rounded-lg bg-muted caption-xs-medium text-foreground uppercase">
                                                    {item.clubAcronym}
                                                </span>
                                                <Link
                                                    href={`/market/clubs/${item.clubId}`}
                                                    className="body-sm-medium text-foreground underline decoration-transparent hover:decoration-current transition-all"
                                                >
                                                    {item.clubName}
                                                </Link>
                                            </div>
                                        </td>

                                        {/* Estatísticas */}
                                        <td className="px-2 text-center text-foreground body-sm">{item.played}</td>
                                        <td className="px-2 text-center text-foreground body-sm">{item.won}</td>
                                        <td className="px-2 text-center text-foreground body-sm">{item.drawn}</td>
                                        <td className="px-2 text-center text-foreground body-sm">{item.lost}</td>
                                        <td className="px-2 text-center text-foreground body-sm">{item.goalsFor}</td>
                                        <td className="px-2 text-center text-foreground body-sm">{item.goalsAgainst}</td>
                                        <td className="px-2 text-center text-foreground body-sm font-medium">
                                            {item.goalDifference > 0 ? `+${item.goalDifference}` : item.goalDifference}
                                        </td>
                                        <td className="px-4 text-center text-foreground body-sm-semibold font-bold">
                                            {item.points}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Legenda inferior idêntica à da imagem */}
            <footer className="border-t border-border px-4 py-3 caption-xs text-muted-foreground">
                J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols sofridos · SG: saldo de gols · Pts: pontos
            </footer>
        </section>
    );
}