import { useState } from "react";
import { fetchApi } from "../lib/api";


export type ClubForm = {
    name: string;
    acronym: string;
}

export const initialForm: ClubForm = {
    name: "",
    acronym: "",
};

export interface CreatedClub {
    id: number;
    name: string;
    acronym: string;
    cash: number;
    squad_value: number;
    net_worth: number;
}

interface UseCreateClubOptions {
    onSuccess?: (club: CreatedClub) => void;
}

export function useCreateClub(options?: UseCreateClubOptions) {
    const [form, setForm] = useState<ClubForm>(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);


    function updateField<K extends keyof ClubForm>(key: K, value: ClubForm[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        if (error) setError(null);
    }

    function resetForm() {
        setForm(initialForm);
        setError(null);
    }

    async function createClub() {
        if (!form.name.trim() || !form.acronym.trim()) {
            setError("Preencha o nome e a sigla do clube.");
            return false;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetchApi<CreatedClub>("/clubs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name,
                    acronym: form.acronym.toUpperCase(),
                }),
            });
            resetForm();
            options?.onSuccess?.(response);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível salvar o clube."
            );

        } finally {
            setSaving(false);
        }
    }

    return { form, saving, error, updateField, resetForm, createClub }
}