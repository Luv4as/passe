import { useState } from "react";
import { Player } from "./useTableData";
import { fetchApi } from "../lib/api";


export interface BuyPlayerForm {
    clubId: number;
    data: string;
    hora: string;
}

interface UseChangeConditionOptions {
    onSuccess?: () => void;
}

export function useBuyPlayer(player: Player, options?: UseChangeConditionOptions) {
    const [error, setError] = useState<string | null>(null);
    const [buying, setBuying] = useState(false);
    const [form, setForm] = useState<BuyPlayerForm>({
        clubId: player.clubId ?? 0,
        data: "",
        hora: "",
    });

    function updateField<K extends keyof BuyPlayerForm>(field: K, value: BuyPlayerForm[K]) {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (error) setError(null);
    }

    async function buyPlayer() {
        if (!form.clubId || form.clubId === 0) {
            setError("Selecione o clube comprador.");
            return false;
        }
        if (!form.data || !form.hora) {
            setError("Selecione a data e hora da compra.");
            return false;
        }

        setBuying(true);
        setError(null);

        try {
            const loyaltyUntil = `${form.data}T${form.hora}-03:00`;
            const playerId = player.id;

            await fetchApi(`/players/${playerId}/buy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    club_id: form.clubId,
                    loyalty_until: loyaltyUntil
                }),
            });
            options?.onSuccess?.();
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Não foi possível comprar o jogador.";
            setError(errorMessage);
            return false;
        } finally {
            setBuying(false);
        }
    }

    return { form, updateField, buyPlayer, error, buying };
}