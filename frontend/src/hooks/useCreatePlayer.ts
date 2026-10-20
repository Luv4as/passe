"use client";

import { useState } from "react";
import { fetchApi } from "@/src/lib/api";
import { type PlayerStats } from "../components/statsPreview";

export const positions = [
    ["GOL", "Goleiro"],
    ["ZAG", "Zagueiro"],
    ["LAT", "Lateral"],
    ["MEI", "Meio-campo"],
    ["ATA", "Atacante"],
] as const;

export type PlayerPosition = (typeof positions)[number][0];

export type PlayerForm = PlayerStats & {
    name: string;
    position: PlayerPosition;
    age: number;
    agility: number;
    potential: number;
};

export const initialForm: PlayerForm = {
    name: "",
    position: "MEI",
    age: 23,
    agility: 70,
    pace: 66,
    shooting: 62,
    passing: 74,
    dribbling: 70,
    defending: 48,
    physical: 58,
    potential: 82,
};

export interface CreatedPlayer {
    name: string;
    base_value: number;
    market_value: number;
    overall: number;
}

interface UseCreatePlayerOptions {
    onSuccess?: (player: CreatedPlayer) => void;
}

export function useCreatePlayer(options?: UseCreatePlayerOptions) {
    const [form, setForm] = useState<PlayerForm>(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function updateField<K extends keyof PlayerForm>(key: K, value: PlayerForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function resetForm() {
        setForm(initialForm);
        setError(null);
    }

    async function createPlayer() {
        setSaving(true);
        setError(null);
        try {
            const player = await fetchApi<CreatedPlayer>("/players", {
                method: "POST",
                body: JSON.stringify(form),
            });
            
            resetForm();
            options?.onSuccess?.(player);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Não foi possível salvar o jogador."
            );
        } finally {
            setSaving(false);
        }
    }

    return {
        form,
        saving,
        error,
        updateField,
        resetForm,
        createPlayer,
    };
}