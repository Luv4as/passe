"use client"

import { GlobeIcon } from "lucide-react"

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
} from "@/components/ui/combobox"
import { InputGroupAddon } from "@/components/ui/input-group"

interface DropdownProps {
    placeholder?: string;
    opcoes?: string[];
    icon?: React.ReactNode;
}

export function Dropdown({ opcoes, placeholder, icon }: DropdownProps) {
    return (
        <div className="flex flex-row items-center gap-2">
            <Combobox items={opcoes}>
                <ComboboxInput placeholder={placeholder}>
                    <InputGroupAddon>
                        {icon ? icon : <GlobeIcon className="h-4 w-4" />}
                    </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent alignOffset={-28} className="w-60">
                    <ComboboxEmpty>Item não encontrado</ComboboxEmpty>
                    <ComboboxList>
                        {(item) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    )
}
