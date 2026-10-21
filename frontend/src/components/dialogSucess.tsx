"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CircleCheck } from "lucide-react";
import type { CreatedPlayer } from "@/src/hooks/useCreatePlayer";
import { Player } from "../hooks/useTableData";
import { Button } from "@/components/ui/button";
import { formatCoins } from "../lib/utils";

export interface MetricItem {
    title: string;
    subtitle: string;
    value: string | number;
    highlighted?: boolean;
}

export interface PrimaryActionProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

interface DialogCreatedProps {
    player: CreatedPlayer | Player | null;
    metrics?: MetricItem[];
    description?: string;
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    primaryAction?: PrimaryActionProps;
    closeText?: string;
}

export function DialogSucess({ player, open, onOpenChange, title, description, metrics: customMetrics, primaryAction, closeText }: DialogCreatedProps) {
    if (!player) return null;

    const playerName = player.name;
    const baseValue = "base_value" in player ? player.base_value : player.baseValue;
    const marketValue = "market_value" in player ? player.market_value : player.marketValue;

    const defaultMetrics = [
        { title: "Valor base", subtitle: "Calculado pela API", value: `${formatCoins(baseValue)}` },
        { title: "Valor de mercado", subtitle: "Calculado pela API", value: `${formatCoins(marketValue)}` },
        { title: "Overall", subtitle: "Calculado pela API", value: player.overall, highlighted: true },
    ];

    const metricsToRender = customMetrics && customMetrics.length > 0 ? customMetrics : defaultMetrics;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {title}
                        <CircleCheck size={18} className="text-success" aria-hidden="true" />
                    </DialogTitle>
                    <DialogDescription>
                        {description ?? `${playerName} foi processado com sucesso e teve seus valores atualizados pela API.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    {metricsToRender.map((metric) => (
                        <div
                            key={metric.title}
                            className="flex items-center justify-between gap-4 p-4">
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
                <DialogFooter className="border-none">
                    {primaryAction && (
                        <Button
                            type="button"
                            variant={primaryAction.variant ?? "outline"}
                            onClick={() => {
                                primaryAction.onClick?.();
                                onOpenChange(false);
                            }}
                        >
                            {primaryAction.label}
                            {primaryAction.icon}
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={() => onOpenChange(false)}>
                        {closeText ?? "Fechar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
