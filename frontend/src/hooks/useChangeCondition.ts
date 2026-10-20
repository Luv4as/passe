import { useState } from "react";
import { fetchApi } from "../lib/api";
import { type PlayerCondition } from "./tableData";

interface UseChangeConditionOptions {
    onSuccess?: () => void;
}

export function useChangeCondition(options?: UseChangeConditionOptions) {
    const [error, setError] = useState<string | null>(null);
    const [changing, setChanging] = useState(false);

    async function changePlayerCondition(playerId: number, newCondition: PlayerCondition | string): Promise<boolean> {
        setChanging(true);
        setError(null);
        try {
            await fetchApi<void>(`/players/${playerId}/condition`, {
                method: "PATCH",
                body: JSON.stringify({ condition: newCondition }),
            });
            options?.onSuccess?.();
            return true;
        } catch (error) {
           const errorMessage = error instanceof Error ? error.message : "Não foi possível alterar a condição do jogador.";
            setError(errorMessage);
            return false;
        } finally {
            setChanging(false);
        }
    }
    return { changePlayerCondition, error, changing };
}