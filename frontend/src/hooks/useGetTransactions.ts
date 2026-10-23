import { useCallback, useState } from "react";
import { fetchApi } from "../lib/api";

export type TransactionType = "COMPRA" | "VENDA";

export interface TransactionItem {
    id: number;
    clubId: number;
    playerId: number;
    playerName: string;
    type: TransactionType;
    value: number;
    fee: number;
    penalty: number;
    profit: number | null; 
    cashChange: number;
    createdAt: string;
}

interface TransactionRaw {
    id: number;
    club_id: number;
    player_id: number;
    player_name: string;
    type: TransactionType;
    value: number;
    fee: number;
    penalty: number;
    profit: number | null;
    cash_change: number;
    created_at: string;
}

export interface SummaryTransactions {
    totalSpent: number;
    totalReceived: number;
    totalFees: number;
    totalPenalties: number;
    totalProfit: number;
}

interface SummaryRaw {
    total_spent: number;
    total_received: number;
    total_fees: number;
    total_penalties: number;
    total_profit: number;
}

interface TransactionsResponseRaw {
    data: TransactionRaw[];
    summary: SummaryRaw;
}

export interface GetTransactionsFilters {
    type?: TransactionType[];
    playerId?: number;
}

export function useGetTransactions() {
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [summary, setSummary] = useState<SummaryTransactions | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getTransactions = useCallback(async (clubId: number, filters?: GetTransactionsFilters) => {
        if (!clubId) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.type && filters.type.length > 0) {
                params.append("type", filters.type.join(","));
            }
            if (filters?.playerId) {
                params.append("player_id", String(filters.playerId));
            }

            const queryString = params.toString();
            const endpoint = `/clubs/${clubId}/transactions${queryString ? `?${queryString}` : ""}`;

            const response = await fetchApi<TransactionsResponseRaw>(endpoint, {
                method: "GET",
            });

            const mappedTransactions: TransactionItem[] = response.data.map((item) => ({
                id: item.id,
                clubId: item.club_id,
                playerId: item.player_id,
                playerName: item.player_name,
                type: item.type,
                value: item.value,
                fee: item.fee,
                penalty: item.penalty,
                profit: item.profit,
                cashChange: item.cash_change,
                createdAt: item.created_at,
            }));

            const mappedSummary: SummaryTransactions = {
                totalSpent: response.summary.total_spent,
                totalReceived: response.summary.total_received,
                totalFees: response.summary.total_fees,
                totalPenalties: response.summary.total_penalties,
                totalProfit: response.summary.total_profit,
            };

            setTransactions(mappedTransactions);
            setSummary(mappedSummary);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        transactions,
        summary,
        loading,
        error,
        getTransactions,
    };
}