"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { Player } from "../hooks/tableData";
import { useDeletePlayer } from "../hooks/useDeletePlayer";
import { useToastManager } from "@/components/ui/toast";
import { CardPlayer } from "@/components/ui/card-player";

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
                <CardPlayer player={player}></CardPlayer>
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