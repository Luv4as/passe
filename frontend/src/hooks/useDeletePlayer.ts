import { useState } from "react";
import { fetchApi } from "../lib/api";

interface UseDeletePlayerOptions {
    onSuccess?: () => void;
}

export function useDeletePlayer(options?: UseDeletePlayerOptions) {
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function deletePlayer(playerId: number): Promise<boolean> {
        setDeleting(true);
        setError(null);
        try {
            await fetchApi<void>(`/players/${playerId}`, {
                method: "DELETE",
            });
            options?.onSuccess?.();
            return true;
        } catch (submitError) {
            const errorMessage = submitError instanceof Error
                ? submitError.message
                : "Não foi possível excluir o jogador.";
            setError(errorMessage);
            return false;
        } finally {
            setDeleting(false);
        }
    }

    return { deletePlayer, error, deleting };
}