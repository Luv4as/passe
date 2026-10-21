import { useState } from "react";
import { Player } from "./useTableData";
import { fetchApi } from "../lib/api";


export interface BuyPlayerForm {
    clubId: number;
    data: string;
    hora: string;
}

export interface BuyTransactionResponse {
    id: number;
    club_id: number;
    player_id: number;
    player_name: string;
    type: string;
    value: number;
    fee: number;
    penalty: number;
    profit: number | null;
    cash_change: number;
    created_at: string;
    contract: {
        purchase_value: number;
        loyalty_until: string;
        status: string;
    };
    club_cash: number;
}

interface UseChangeConditionOptions {
    onSuccess?: (data: BuyTransactionResponse) => void;
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
            let [hours, minutes] = form.hora.split(":");
            const h = Number(hours);

            if (h >= 21) {
                hours = "20";
                minutes = "59";
            }

            const timeOnly = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
            const loyaltyUntil = `${form.data}T${timeOnly}-03:00`;
            const playerId = player.id;

            const response = await fetchApi<BuyTransactionResponse>(`/players/${playerId}/buy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    club_id: form.clubId,
                    loyalty_until: loyaltyUntil
                }),
            });
            options?.onSuccess?.(response);
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