"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { Player } from "../hooks/tableData";
import { useDeletePlayer } from "../hooks/useDeletePlayer";
import { useToastManager } from "@/components/ui/toast";

interface DialogDeleteProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    player: Player;
}

export default function DialogDelete({ open, onOpenChange, onConfirm, onCancel, player }: DialogDeleteProps) {
    const toastManager = useToastManager();
    const { deletePlayer, deleting, error } = useDeletePlayer({
        onSuccess: () => {
            const id = toastManager.add({
                type: "success",
                title: "Jogador excluído",
                description: `${player.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
                actionProps: {
                    onClick() {
                        toastManager.close(id);
                    },
                },
            });
            onConfirm?.();
            onOpenChange?.(false);
        },
    });

    if (!player) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Excluir {player.name}</DialogTitle>
                    <DialogDescription>
                        O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas.
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex flex-row w-full justify-between gap-2 py-3 px-3.5">
                        <div className="flex items-center gap-4">
                            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full caption-xs-medium ${player.avatarClass}`}>
                                {player.initials}
                            </span>
                            <span className="flex flex-col whitespace-nowrap">
                                <span className="font-medium leading-5 text-foreground">
                                    {player.name}
                                </span>
                                <span className="caption-xs-medium leading-4 text-muted-foreground">
                                    {player.position} . {player.positionLabel} . {player.age} anos
                                </span>
                            </span>
                        </div>
                        {player.clubName ? (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="rounded bg-muted px-1 py-0.5 caption-xs-medium">
                                    {player.clubCode}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="rounded-lg bg-muted px-2 py-1 caption-xs-medium">
                                    Livre
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter className="sm:justify-end border-none">
                    <Button
                        type="button"
                        className="bg-background text-foreground border border-border hover:bg-muted"
                        onClick={() => {
                            onCancel?.();
                            onOpenChange?.(false);
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive flex items-center gap-2"
                        disabled={deleting}
                        onClick={() => {
                            void deletePlayer(player.id);
                        }}
                    >
                        <Trash size={16} />
                        {deleting ? "Excluindo..." : "Excluir jogador"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}