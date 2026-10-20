"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CircleCheck } from "lucide-react";
import type { CreatedPlayer } from "@/src/hooks/useCreatePlayer";

interface DialogCreatedProps {
    player: CreatedPlayer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatCoins(value: number) {
    return value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function DialogCreated({ player, open, onOpenChange }: DialogCreatedProps) {
    if (!player) return null;

    const metrics = [
        { title: "Valor base", subtitle: "Calculado pela API", value: `${formatCoins(player.base_value)} moedas` },
        { title: "Valor de mercado", subtitle: "Calculado pela API", value: `${formatCoins(player.market_value)} moedas` },
        { title: "Overall", subtitle: "Calculado pela API", value: player.overall, highlighted: true },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Jogador cadastrado
                        <CircleCheck size={18} className="text-success" aria-hidden="true" />
                    </DialogTitle>
                    <DialogDescription>
                        {player.name} entrou livre e Apto. Os valores abaixo foram calculados pela API.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    {metrics.map((metric) => (
                        <div key={metric.title} className="flex items-center justify-between gap-4 p-4">
                            <div className="flex min-w-0 flex-col gap-0.5">
                                <span className={`body-sm-semibold ${metric.highlighted ? " text-foreground" : "font-medium text-foreground/80"}`}>
                                    {metric.title}
                                </span>
                                <span className="caption-xs text-muted-foreground">{metric.subtitle}</span>
                            </div>
                            <span className="max-w-[65%] truncate text-right body-sm tracking-tight text-foreground">
                                {metric.value}
                            </span>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
