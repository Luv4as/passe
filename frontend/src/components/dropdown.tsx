"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

interface DropdownProps {
    player?: string;
    buttonText: React.ReactNode;
    items: DropdownItem[];
    className?: string;
    align?: "start" | "center" | "end";
}

export function Dropdown({
    player,
    buttonText,
    items,
    className,
    align = "end",
}: DropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={className}>
                {buttonText}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="w-48">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>{player}</DropdownMenuLabel>
                    {items.map((item, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={`flex items-center gap-2 cursor-pointer ${item.label === "Excluir" ? "text-destructive" : ""}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}