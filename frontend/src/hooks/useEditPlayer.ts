import { useState } from "react";
import { PlayerPosition } from "./useCreatePlayer";
import { Player } from "./useTableData";
import { fetchApi } from "../lib/api";

export const positions = [
    ["GOL", "Goleiro"],
    ["ZAG", "Zagueiro"],
    ["LAT", "Lateral"],
    ["MEI", "Meio-campo"],
    ["ATA", "Atacante"],
] as const;

export interface EditPlayerForm {
    name: string;
    position: string;
    age: number;
    agility: number;
}

interface UseEditPlayerOptions {
    onSuccess?: () => void;
}

export function useEditPlayer(player?: Player, options?: UseEditPlayerOptions) {
    const [form, setForm] = useState<EditPlayerForm>({
        name: player?.name ?? "",
        position: (player?.position as PlayerPosition) ?? "MEI",
        age: player?.age ?? 23,
        agility: player?.agility ?? 70,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function updateField<K extends keyof EditPlayerForm>(key: K, value: EditPlayerForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function editPlayer(playerId: number) {
        setSaving(true);
        setError(null);

        if (player && form.age < player.age) {
            setError("A idade do jogador não pode ser menor que a idade atual.");
            setSaving(false);
            return false;
        }

        try {
            await fetchApi<void>(`/players/${playerId}`, {
                method: "PUT",
                body: JSON.stringify(form),
            });

            options?.onSuccess?.();
            return true;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao editar jogador."
            );
            return false
        } finally {
            setSaving(false);
        }
    }

    return {
        form,
        saving,
        error,
        updateField,
        editPlayer,
    };
}