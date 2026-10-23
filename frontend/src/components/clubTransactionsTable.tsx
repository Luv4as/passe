"use client"

import { useEffect, useState, useMemo } from "react";
import { useGetTransactions, TransactionType } from "@/src/hooks/useGetTransactions";
import { useExportTransactions } from "@/src/hooks/useExportTransactions";
import { getPlayerAvatarClass, getPlayerInitials } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Download,
    ShoppingCart,
    HandCoins,
    User,
    Coins,
    TrendingUp,
    AlertTriangle,
    Check,
    History,
    Info,
} from "lucide-react";
import { IconContainer } from "@/components/ui/icon-container";

interface ClubTransactionsTableProps {
    clubId: number;
}

export function ClubTransactionsTable({ clubId }: ClubTransactionsTableProps) {
    const { transactions, summary, loading, error, getTransactions } = useGetTransactions();
    const { exportTransactions, exporting } = useExportTransactions();

    // Estados dos Filtros
    const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>(["COMPRA", "VENDA"]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("TODOS");

    // Recarrega os dados da API sempre que os filtros mudam
    useEffect(() => {
        if (!clubId) return;

        const filters = {
            type: selectedTypes.length > 0 ? selectedTypes : undefined,
            playerId: selectedPlayerId !== "TODOS" ? Number(selectedPlayerId) : undefined,
        };

        void getTransactions(clubId, filters);
    }, [clubId, selectedTypes, selectedPlayerId, getTransactions]);

    // Lista única de jogadores com ID e Nome para a combobox
    const uniquePlayers = useMemo(() => {
        const map = new Map<number, string>();
        transactions.forEach((tx) => {
            if (!map.has(tx.playerId)) {
                map.set(tx.playerId, tx.playerName);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [transactions]);

    // Nome do jogador selecionado para renderizar no acionador do Select
    const selectedPlayerName = useMemo(() => {
        if (selectedPlayerId === "TODOS") return "Jogador: todos";
        const found = uniquePlayers.find((p) => String(p.id) === selectedPlayerId);
        return found ? found.name : "Jogador: todos";
    }, [selectedPlayerId, uniquePlayers]);

    // Alternar filtros de tipo (Compra / Venda)
    const toggleType = (type: TransactionType) => {
        setSelectedTypes((prev) => {
            if (prev.includes(type)) {
                if (prev.length === 1) return prev;
                return prev.filter((t) => t !== type);
            }
            return [...prev, type];
        });
    };

    const handleExport = () => {
        const filters = {
            type: selectedTypes.length > 0 ? selectedTypes : undefined,
            playerId: selectedPlayerId !== "TODOS" ? Number(selectedPlayerId) : undefined,
        };
        void exportTransactions(clubId, filters);
    };

    const formatDate = (isoString: string) => {
        try {
            const date = new Date(isoString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return { dateStr: `${day}/${month}/${year}`, timeStr: `${hours}:${minutes}` };
        } catch {
            return { dateStr: "—", timeStr: "" };
        }
    };

    const formatCurrency = (val: number | null | undefined) => {
        if (val === null || val === undefined) return "—";
        return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Header com Título e Botão de Exportação */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Histórico de transações</h3>
                    <p className="text-xs text-muted-foreground">
                        Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={exporting || loading}
                    className="shrink-0"
                >
                    <Download size={14} className="mr-1.5" />
                    {exporting ? "Exportando..." : "Exportar CSV"}
                </Button>
            </div>

            {/* Barra de Filtros (Tipos e Combobox Jogador) */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">Tipo</span>

                {/* Botão Filtro Compra */}
                <button
                    type="button"
                    onClick={() => toggleType("COMPRA")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedTypes.includes("COMPRA")
                        ? "bg-primary-soft border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                >
                    <span className={`flex size-3.5 items-center justify-center rounded border ${selectedTypes.includes("COMPRA") ? "bg-primary border-primary text-white" : "border-muted-foreground"
                        }`}>
                        {selectedTypes.includes("COMPRA") && <Check size={10} />}
                    </span>
                    Compra
                </button>

                {/* Botão Filtro Venda */}
                <button
                    type="button"
                    onClick={() => toggleType("VENDA")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedTypes.includes("VENDA")
                        ? "bg-primary-soft border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                >
                    <span className={`flex size-3.5 items-center justify-center rounded border ${selectedTypes.includes("VENDA") ? "bg-primary border-primary text-white" : "border-muted-foreground"
                        }`}>
                        {selectedTypes.includes("VENDA") && <Check size={10} />}
                    </span>
                    Venda
                </button>

                {/* Combobox do Jogador com exibiçao por nome e envio por ID */}
                <div className="ml-auto sm:ml-0">
                    <Select
                        value={selectedPlayerId}
                        onValueChange={(val) => setSelectedPlayerId(val ?? "TODOS")}
                    >
                        <SelectTrigger className="w-45 h-8 caption-xs bg-card border-border">
                            <User size={14} className="mr-1 text-muted-foreground shrink-0" />
                            <SelectValue>{selectedPlayerName}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODOS" className="caption-xs">Jogador: todos</SelectItem>
                            {uniquePlayers.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)} className="caption-xs">
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error ? (
                <div className="flex flex-row items-center gap-3 px-3 py-2.5 w-full rounded-xl border border-border bg-destructive-soft">
                    <Info size={16} className="text-destructive-soft-foreground shrink-0" />
                    <p className="body-sm text-destructive-soft-foreground">
                        <div className="flex flex-col gap-1">
                            <p>O filtro foi recusado</p>
                            <p>{error}</p>
                        </div>
                    </p>
                </div>
            ) : (
                /* Tabela Principal */
                <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left caption-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                                    <th className="py-3 px-4">Data e hora</th>
                                    <th className="py-3 px-4">Tipo</th>
                                    <th className="py-3 px-4">Jogador</th>
                                    <th className="py-3 px-4 text-right">Valor</th>
                                    <th className="py-3 px-4 text-right">Taxa ou comissão</th>
                                    <th className="py-3 px-4 text-right">Multa</th>
                                    <th className="py-3 px-4 text-right">Lucro</th>
                                    <th className="py-3 px-4 text-right">Variação do caixa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                            <div className="flex flex-row items-center gap-3 px-3 py-2.5 w-full divide-border overflow-hidden rounded-xl border border-border">
                                                <Info size={16} className="text-foreground" />
                                                <p className="body-sm text-foreground">
                                                    Carregando histórico...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>

                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <IconContainer className="bg-muted border border-border h-12 w-12 flex items-center justify-center rounded-xl">
                                                    <History size={24} className="text-muted-foreground" />
                                                </IconContainer>
                                                <p className="heading-card text-foreground font-semibold mt-1">
                                                    Nenhuma transação encontrada
                                                </p>
                                                <p className="body-sm text-muted-foreground max-w-sm">
                                                    Não há transações para os filtros de tipo e jogador selecionados.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => {
                                        const { dateStr, timeStr } = formatDate(tx.createdAt);
                                        const initials = getPlayerInitials(tx.playerName);
                                        const avatarClass = getPlayerAvatarClass(tx.playerName);

                                        return (
                                            <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                                {/* Data e Hora */}
                                                <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                                                    <span className="body-sm text-foreground">{dateStr}</span>{" "}
                                                    <span className="text-muted-foreground">{timeStr}</span>
                                                </td>

                                                {/* Badge do Tipo */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    {tx.type === "COMPRA" ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 caption-xs text-foreground border border-border">
                                                            <ShoppingCart size={12} className="text-muted-foreground" />
                                                            Compra
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 caption-xs text-foreground border border-border">
                                                            <HandCoins size={12} className="text-muted-foreground" />
                                                            Venda
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Avatar + Nome do Jogador */}
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] caption-xs ${avatarClass}`}>
                                                            {initials}
                                                        </span>
                                                        <span className="body-sm-medium text-foreground">
                                                            {tx.playerName}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Valor */}
                                                <td className="py-3 px-4 text-right whitespace-nowrap body-sm text-foreground">
                                                    {formatCurrency(tx.value)}
                                                </td>

                                                {/* Taxa ou Comissão */}
                                                <td className="py-3 px-4 text-right whitespace-nowrap body-sm text-foreground">
                                                    {formatCurrency(tx.fee)}
                                                </td>

                                                {/* Multa */}
                                                <td className="py-3 px-4 text-right whitespace-nowrap body-sm text-muted-foreground">
                                                    {formatCurrency(tx.penalty)}
                                                </td>

                                                {/* Lucro */}
                                                <td className="py-3 px-4 text-right whitespace-nowrap body-sm">
                                                    {tx.profit === null ? (
                                                        <span className="text-muted-foreground">—</span>
                                                    ) : tx.profit > 0 ? (
                                                        <span className="text-success">
                                                            +{formatCurrency(tx.profit)}
                                                        </span>
                                                    ) : tx.profit < 0 ? (
                                                        <span className="text-destructive">
                                                            {formatCurrency(tx.profit)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">0,00</span>
                                                    )}
                                                </td>

                                                {/* Variação do Caixa */}
                                                <td className="py-3 px-4 text-right whitespace-nowrap body-sm">
                                                    {tx.cashChange > 0 ? (
                                                        <span className="text-success">
                                                            +{formatCurrency(tx.cashChange)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-destructive">
                                                            {formatCurrency(tx.cashChange)}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Grid dos Totais (Summary) no Rodapé da Tabela */}
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-border border-t border-border bg-muted/20">
                            {/* Total Pago em Compras */}
                            <div className="p-3.5 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-muted-foreground caption-xs">
                                    <ShoppingCart size={13} />
                                    <span>Total pago em compras</span>
                                </div>
                                <span className="heading-card text-foreground">
                                    {formatCurrency(summary.totalSpent)}
                                </span>
                                <span className="caption-xs text-muted-foreground">Valor + taxa</span>
                            </div>

                            {/* Total Recebido em Vendas */}
                            <div className="p-3.5 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-muted-foreground caption-xs">
                                    <HandCoins size={13} />
                                    <span>Total recebido em vendas</span>
                                </div>
                                <span className="heading-card text-foreground">
                                    {formatCurrency(summary.totalReceived)}
                                </span>
                                <span className="caption-xs text-muted-foreground">Crédito líquido</span>
                            </div>

                            {/* Taxas e Comissões */}
                            <div className="p-3.5 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-muted-foreground caption-xs">
                                    <Coins size={13} />
                                    <span>Taxas e comissões</span>
                                </div>
                                <span className="heading-card text-foreground">
                                    {formatCurrency(summary.totalFees)}
                                </span>
                                <span className="caption-xs text-muted-foreground">Somadas</span>
                            </div>

                            {/* Multas */}
                            <div className="p-3.5 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-muted-foreground caption-xs">
                                    <AlertTriangle size={13} />
                                    <span>Multas</span>
                                </div>
                                <span className="heading-card text-foreground">
                                    {formatCurrency(summary.totalPenalties)}
                                </span>
                                <span className="caption-xs text-muted-foreground">Por fidelidade</span>
                            </div>

                            {/* Lucro Total */}
                            <div className="p-3.5 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-muted-foreground caption-xs">
                                    <TrendingUp size={13} />
                                    <span>Lucro total</span>
                                </div>
                                <span className={`heading-card ${summary.totalProfit > 0
                                    ? "text-success"
                                    : summary.totalProfit < 0
                                        ? "text-destructive"
                                        : "text-foreground"
                                    }`}>
                                    {summary.totalProfit > 0 ? `+${formatCurrency(summary.totalProfit)}` : formatCurrency(summary.totalProfit)}
                                </span>
                                <span className="caption-xs text-muted-foreground">Soma dos lucros, com sinal</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}