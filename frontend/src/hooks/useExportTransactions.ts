import { useCallback, useState } from "react";
import { TransactionType } from "./useGetTransactions";

export interface ExportTransactionsFilters {
    type?: TransactionType[];
    playerId?: number;
}

export function useExportTransactions() {
    const [exporting, setExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const exportTransactions = useCallback(async (clubId: number, filters?: ExportTransactionsFilters) => {
        if (!clubId) return;

        setExporting(true);
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
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
            const endpoint = `${baseUrl}/clubs/${clubId}/transactions/export${queryString ? `?${queryString}` : ""}`;

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Accept: "text/csv, application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Erro ao exportar CSV (${response.status})`);
            }

            const csvText = await response.text();

            const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            
            link.href = url;
            link.setAttribute("download", `historico-transacoes-clube-${clubId}.csv`);
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao exportar o histórico em CSV";
            setError(errorMessage);
        } finally {
            setExporting(false);
        }
    }, []);

    return {
        exportTransactions,
        exporting,
        error,
    };
}