import { useState } from "react";
import { fetchApi } from "../lib/api";


export type MatchForm = {
    homeClubId: number;
    awayClubId: number;
}

export const initialMatchForm: MatchForm = {
    homeClubId: 0,
    awayClubId: 0,
};

export interface MatchTeamResult {
    club_id: number;
    club_name: string;
    formation: string;
    goals: number;
}

export interface MatchDuelParticipant {
    player_id: number;
    player_name: string;
    position: string;
    condition: string;
    attribute: string;
    value: number;
}

export interface MatchDuel {
    order: number;
    attacking_club_id: number;
    attacker: MatchDuelParticipant;
    defender: MatchDuelParticipant;
    goal: boolean;
}

export interface CreatedMatch {
    id: number;
    played_at: string;
    home: MatchTeamResult;
    away: MatchTeamResult;
    result: "MANDANTE" | "VISITANTE" | "EMPATE";
    duels: MatchDuel[];
}

interface UseCreateMatchOptions {
    onSuccess?: (match: CreatedMatch) => void;
}

export function useCreateMatch(options?: UseCreateMatchOptions) {
    const [form, setForm] = useState<MatchForm>(initialMatchForm);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function updateField<K extends keyof MatchForm>(key: K, value: MatchForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        if (error) setError(null);
    }

    function resetForm() {
        setForm(initialMatchForm);
        setError(null);
    }

    async function createMatch(): Promise<CreatedMatch | null> {
        if (!form.homeClubId || !form.awayClubId) {
            setError("Selecione os dois clubes para criar a partida.");
            return null;
        }
        if (form.homeClubId === form.awayClubId) {
            setError("O clube da casa e o clube visitante não podem ser o mesmo.");
            return null;
        }

        setSaving(true);
        setError(null);
        try {
            const response = await fetchApi<CreatedMatch>("/matches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    home_club_id: form.homeClubId,
                    away_club_id: form.awayClubId,
                }),
            });
            resetForm();
            options?.onSuccess?.(response);
            return response;
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro ao criar a partida."
            );
            return null;
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
        createMatch,
    };
}