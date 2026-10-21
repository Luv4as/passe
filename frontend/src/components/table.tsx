"use client";

import {
    ArrowDownUp,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    ShoppingCart,
    Eye,
    Pencil,
    HeartPulse,
    Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Player, useTableData, type PlayerCondition, type TableDataOptions } from "@/src/hooks/tableData";
import { Dropdown } from "./dropdown";
import DialogDelete from "./dialogDelete";
import { DialogCondition } from "./dialogCondition";
import { DialogEdit } from "./dialogEdit";

const conditionClasses: Record<PlayerCondition, string> = {
    Apto: "border-success-soft-border bg-success-soft text-success-soft-foreground",
    "Mal condicionado": "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
    Doente: "border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground",
};

function ConditionBadge({ condition }: { condition: PlayerCondition }) {
    return (
        <span className={`inline-flex h-5 items-center gap-1 rounded-lg border px-2 caption-xs-medium font-medium whitespace-nowrap ${conditionClasses[condition]}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {condition}
        </span>
    );
}

function PaginationItem({ active, children }: { active?: boolean; children: React.ReactNode }) {
    return (
        <button
            type="button"
            className={`flex size-9 items-center justify-center rounded-lg body-sm ${active ? "border border-border bg-background" : "text-foreground"}`}
        >
            {children}
        </button>
    );
}

interface PlayersTableProps {
    filters?: Pick<TableDataOptions, "search" | "position" | "condition" | "clubId" | "minAge" | "maxAge" | "minValue" | "maxValue">;
}

export default function PlayersTable({ filters = {} }: PlayersTableProps) {
    const [tab, setTab] = useState<"Todos" | "Livres" | "Em clubes">("Todos");
    const [sortAscending, setSortAscending] = useState(true);
    const [page, setPage] = useState(1);
    const { players, totalItems, totalPages, loading, error } = useTableData({
        ...filters,
        free: tab === "Todos" ? undefined : tab === "Livres",
        sort: "name",
        page,
        limit: 10,
    });
    const [playerIsDeleted, setPlayerIsDeleted] = useState<Player | null>(null);
    const [playerConditionChanged, setPlayerConditionChanged] = useState<Player | null>(null);
    const [playerEdited, setPlayerEdited] = useState<Player | null>(null);

    const visiblePlayers = useMemo(
        () => sortAscending ? players : [...players].reverse(),
        [players, sortAscending],
    );

    function changeTab(nextTab: "Todos" | "Livres" | "Em clubes") {
        setTab(nextTab);
        setPage(1);
    }

    return (
        <section className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="flex items-center rounded-[10px] bg-muted p-0.75 text-sm">
                    {(["Todos", "Livres", "Em clubes"] as const).map((item) => {
                        const count = item === tab ? totalItems : "—";
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => changeTab(item)}
                                className={`flex h-7.5 items-center justify-center gap-1.5 rounded-lg px-2.5 ${tab === item ? "bg-background font-medium text-foreground" : "text-muted-foreground"}`}
                            >
                                {item}<span className="body-sm">{count}</span>
                            </button>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => setSortAscending((value) => !value)}
                    className="flex h-9 w-42.25 items-center gap-2 rounded-lg border border-input bg-background px-3 body-sm text-foreground"
                >
                    <ArrowDownUp size={16} className="text-muted-foreground" />
                    <span className="flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap">Ordenar: nome</span>
                    <ChevronDown size={16} className="text-muted-foreground" />
                </button>
            </header>

            <div className="overflow-x-auto">
                <table className="w-full min-w-280 border-collapse body-sm-medium">
                    <thead className="bg-muted text-muted-foreground">
                        <tr className="h-10 border-b border-border text-left body-sm-medium">
                            <th className="w-auto px-4">Jogador</th>
                            <th className="w-15 px-2">Posição</th>
                            <th className="w-16 px-2 text-right">Overall</th>
                            <th className="w-21 px-2 text-right">Agilidade</th>
                            <th className="w-13 px-2 text-right">Idade</th>
                            <th className="w-33 px-2">Condição</th>
                            <th className="w-22 px-2 text-right">Valor base</th>
                            <th className="w-33 px-2 text-right">Valor de mercado</th>
                            <th className="w-26 px-2">Clube</th>
                            <th className="w-35 px-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} className="h-28 text-center text-muted-foreground">Carregando jogadores...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={10} className="h-28 text-center text-destructive">{error}</td></tr>
                        ) : visiblePlayers.length === 0 ? (
                            <tr><td colSpan={10} className="h-28 text-center text-muted-foreground">Nenhum jogador encontrado.</td></tr>
                        ) : visiblePlayers.map((player) => (
                            <tr key={player.name} className="h-14 border-b border-border last:border-b-0">
                                <td className="px-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full caption-xs-medium ${player.avatarClass}`}>{player.initials}</span>
                                        <span className="flex flex-col whitespace-nowrap">
                                            <span className="font-medium leading-5 text-foreground">{player.name}</span>
                                            <span className="caption-xs-medium leading-4 text-muted-foreground">{player.positionLabel}</span>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-2"><span className="inline-flex rounded-lg border border-border px-2 py-0.5 caption-xs">{player.position}</span></td>
                                <td className="px-2 text-right body-sm-semibold">{player.overall}</td>
                                <td className="px-2">
                                    <div className="flex items-center justify-end gap-2">
                                        <span>{player.agility}</span>
                                        <span className="h-1.5 w-10 rounded-full bg-muted"><span className={`block h-1.5 rounded-full ${player.agility >= 75 ? "bg-success" : player.agility < 30 ? "bg-destructive" : "bg-muted-foreground"}`} style={{ width: `${Math.max(12, player.agility * 0.4)}px` }} /></span>
                                    </div>
                                </td>
                                <td className="px-2 text-right body-sm">{player.age}</td>
                                <td className="px-2"><ConditionBadge condition={player.condition} /></td>
                                <td className="px-2 text-right text-muted-foreground body-sm">{player.baseValue.toFixed(2).replace(".", ",")}</td>
                                <td className="px-2 text-right body-sm-semibold">{player.marketValue.toFixed(2).replace(".", ",")}</td>
                                <td className="px-2">
                                    {player.clubName ?
                                        <div className="flex items-center gap-2 whitespace-nowrap"><span className="rounded bg-muted px-1 py-0.5 caption-xs-medium">
                                            {player.clubCode}
                                        </span><u>{player.clubName}</u>
                                        </div> :
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <span className="rounded-lg bg-muted px-2 py-1 caption-xs-medium">Livre</span>
                                            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3"><ShoppingCart size={16} />Comprar</button>
                                        </div>
                                    }
                                </td>
                                <td className="px-2 text-right">
                                    <Dropdown
                                        player={player.name}
                                        buttonText={<MoreHorizontal size={16} />}
                                        items={[
                                            {
                                                label: "Ver detalhes",
                                                icon: <Eye size={16} />,
                                                onClick: () => alert("Ver detalhes"),
                                            },
                                            {
                                                label: "Editar",
                                                icon: <Pencil size={16} />,
                                                onClick: () => setPlayerEdited(player),
                                            },
                                            {
                                                label: "Alterar Condição",
                                                icon: <HeartPulse size={16} />,
                                                onClick: () => setPlayerConditionChanged(player),
                                            },
                                            {
                                                label: "Comprar",
                                                icon: <ShoppingCart size={16} />,
                                                onClick: () => alert("Comprar"),
                                            },
                                            {
                                                label: "Excluir",
                                                icon: <Trash2 size={16} />,
                                                onClick: () => setPlayerIsDeleted(player),
                                            }
                                        ]}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between border-t border-border px-4 py-3 body-sm">
                <span className="text-muted-foreground">Mostrando {visiblePlayers.length ? (page - 1) * 10 + 1 : 0}–{(page - 1) * 10 + visiblePlayers.length} de {totalItems} jogadores</span>
                <nav aria-label="Paginação" className="flex items-center gap-1">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="flex items-center gap-1 px-2 text-muted-foreground disabled:opacity-50"><ChevronLeft size={16} />Anterior</button>
                    <PaginationItem active>1</PaginationItem>
                    {totalPages > 1 && <PaginationItem>{page === 2 ? "2" : "2"}</PaginationItem>}
                    {totalPages > 2 && <PaginationItem>{page === 3 ? "3" : "3"}</PaginationItem>}
                    <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="flex items-center gap-1 px-2 disabled:opacity-50">Próxima<ChevronRight size={16} /></button>
                </nav>
            </footer>

            {playerIsDeleted && (
                <DialogDelete
                    open={!!playerIsDeleted}
                    onOpenChange={(open) => !open && setPlayerIsDeleted(null)}
                    player={playerIsDeleted}
                    onCancel={() => setPlayerIsDeleted(null)}
                    onConfirm={() => { setPlayerIsDeleted(null) }} />
            )}
            {
                playerConditionChanged && (
                    <DialogCondition
                        open={!!playerConditionChanged}
                        onOpenChange={(open) => !open && setPlayerConditionChanged(null)}
                        player={playerConditionChanged}
                        onCancel={() => setPlayerConditionChanged(null)}
                        onConfirm={() => { setPlayerConditionChanged(null) }} />
                )}
            {
                playerEdited && (
                    <DialogEdit
                        open={!!playerEdited}
                        onOpenChange={(open) => !open && setPlayerEdited(null)}
                        player={playerEdited}
                        onConfirm={() => { setPlayerEdited(null) }} />
                )
            }
        </section>
    );
}