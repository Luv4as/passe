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

interface ComboboxOptionsProps {
    placeholder?: string;
    opcoes?: string[] | ClubItem[];
    icon?: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
}

export function ComboboxOptions({ opcoes = [], placeholder, icon, value, onValueChange }: ComboboxOptionsProps) {

    const isClubList = typeof opcoes[0] === "object";
    const items = isClubList
        ? (opcoes as ClubItem[]).map((c) => String(c.id))
        : (opcoes as string[]);

    const selectedClub = isClubList
        ? (opcoes as ClubItem[]).find((c) => String(c.id) === value)
        : null;

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
                    value={
                        selectedClub
                            ? `${selectedClub.name} (${selectedClub.acronym}) · ${selectedClub.cash.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })} `
                            : value || ""
                    }>
                    <InputGroupAddon>
                        {icon ? icon : <GlobeIcon className="h-4 w-4" />}
                    </InputGroupAddon>
                </ComboboxInput>

                <ComboboxContent alignOffset={-28} className="w-80">
                    <ComboboxEmpty>Nenhum clube encontrado</ComboboxEmpty>
                    <ComboboxList>
                        {(itemId) => {
                            const club = isClubList
                                ? (opcoes as ClubItem[]).find((c) => String(c.id) === itemId)
                                : null;

                            return (
                                <ComboboxItem key={String(itemId)} value={String(itemId)}>
                                    {club ? (
                                        <div className="flex w-full items-center justify-between gap-2 py-0.5">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="body-sm truncate">{club.name} ({club.acronym})</span>
                                            </div>
                                            <span className="caption-xs font-semibold text-primary shrink-0">
                                                {club.cash.toLocaleString("pt-BR", {
                                                    style: "currency",
                                                    currency: "BRL",
                                                })}
                                            </span>
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