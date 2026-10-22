"use client";

import { GlobeIcon } from "lucide-react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { ClubItem } from "@/src/hooks/useGetClubs";

export interface ComboboxOptionItem {
    id: number | string;
    name: string;
    acronym?: string;
    cash?: number;
    [key: string]: unknown;
}

interface ComboboxOptionsProps {
    placeholder?: string;
    opcoes?: ComboboxOptionItem[] | string[];
    icon?: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
}

export function ComboboxOptions({ opcoes = [], placeholder, icon, value, onValueChange }: ComboboxOptionsProps) {


    const isObjectList = typeof opcoes[0] === "object" && opcoes[0] !== null;
    const items = isObjectList
        ? (opcoes as ComboboxOptionItem[]).map((item) => String(item.id))
        : (opcoes as string[]);

    const selectedItem = isObjectList
        ? (opcoes as ComboboxOptionItem[]).find((item) => String(item.id) === value)
        : null;

    const renderInputValue = () => {
        if (!selectedItem) return value || "";

        let label = selectedItem.name;

        if (selectedItem.acronym) {
            label += ` (${selectedItem.acronym})`;
        }

        if (typeof selectedItem.cash === "number") {
            const formattedCash = selectedItem.cash.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            });
            label += ` · ${formattedCash}`;
        }
        return label;
    };

    return (
        <div className="flex flex-row items-center gap-2 w-full">
            <Combobox
                items={items}
                value={value || null}
                onValueChange={(nextValue) => {
                    onValueChange?.(String(nextValue ?? ""));
                }}>
                <ComboboxInput
                    className="w-full"
                    placeholder={placeholder}
                    value={renderInputValue()}>
                    <InputGroupAddon>
                        {icon ? icon : <GlobeIcon className="h-4 w-4" />}
                    </InputGroupAddon>
                </ComboboxInput>

                <ComboboxContent alignOffset={-28} className="w-80">
                    <ComboboxEmpty>Nenhum clube encontrado</ComboboxEmpty>
                    <ComboboxList>
                        {(itemId) => {
                            const option = isObjectList
                                ? (opcoes as ComboboxOptionItem[]).find((item) => String(item.id) === itemId)
                                : null;

                            return (
                                <ComboboxItem key={String(itemId)} value={String(itemId)}>
                                    {option ? (
                                        <div className="flex w-full items-center justify-between gap-2 py-0.5">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="body-sm truncate">{option.name} ({option.acronym})</span>
                                            </div>
                                            {typeof option.cash === "number" && (
                                                <span className="caption-xs font-semibold text-primary shrink-0">
                                                    {option.cash.toLocaleString("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        String(itemId)
                                    )}
                                </ComboboxItem>
                            );
                        }}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}