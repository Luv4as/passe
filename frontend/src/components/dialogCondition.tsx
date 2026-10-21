import { useToastManager } from "@/components/ui/toast";
import { Player } from "../hooks/useTableData";
import { useChangeCondition } from "../hooks/useChangeCondition";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CardPlayer } from "@/components/ui/card-player";
import { RadioCard, RadioCardOption } from "@/components/ui/radio-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGetLineup } from "../hooks/useGetLineup";
import { TriangleAlert } from "lucide-react";


interface DialogConditionProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    player: Player;
}

const CONDITION_OPTIONS: RadioCardOption[] = [
    {
        value: "APTO",
        label: "Apto",
        description: "Sem desconto no valor de mercado.",
    },
    {
        value: "MAL_CONDICIONADO",
        label: "Mal condicionado",
        description: "Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.",
    },
    {
        value: "DOENTE",
        label: "Doente",
        description: "Desconto de 30%, com o mesmo ajuste de agilidade.",
    },
];

function mapConditionToEnum(condition: string): string {
    switch (condition) {
        case "Apto":
            return "APTO";
        case "Mal condicionado":
            return "MAL_CONDICIONADO";
        case "Doente":
            return "DOENTE";
        default:
            return "APTO";
    }
}

export function DialogCondition({ open, onOpenChange, onConfirm, onCancel, player }: DialogConditionProps) {
    const toastManager = useToastManager();
    const [selectedCondition, setSelectedCondition] = useState<string>(() =>
        mapConditionToEnum(player?.condition)
    );
    const { lineup } = useGetLineup(player?.clubId);
    const isStarter = Boolean(lineup?.players?.some((p) => p.id === player?.id));
    const { changePlayerCondition, changing, error } = useChangeCondition({
        onSuccess: () => {
            const id = toastManager.add({
                title: "Condição do jogador alterada",
                description: `A condição do jogador ${player.name} foi alterada com sucesso.`,
                type: "success",
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
    const optionsWithCurrent = CONDITION_OPTIONS.map((opt) => ({
        ...opt,
        isCurrent: opt.value === mapConditionToEnum(player?.condition),
    }));

    return (
        <div>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Alterar condição física
                        </DialogTitle>
                        <DialogDescription>
                            A condição muda o desconto do valor de mercado, recalculado ao salvar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 ">
                        <CardPlayer player={player}></CardPlayer>
                        <RadioCard
                            className="mt-3"
                            options={optionsWithCurrent}
                            value={selectedCondition}
                            onValueChange={setSelectedCondition}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {selectedCondition === "DOENTE" && isStarter && (
                        <div className="w-full overflow-hidden rounded-xl border border-warning-soft-border bg-warning-soft transition-colors p-3.5">
                            <div className="flex flex-row items-center gap-2 mb-2">
                                <TriangleAlert size={16} className="text-warning-soft-foreground" />
                                <p className="text-warning-soft-foreground body-sm-medium">{player.name} é titular</p>
                            </div>
                            <p className="text-warning-soft-foreground body-sm">Ao passar a Doente, ele sai da escalação, e o Águias FC só volta a jogar partidas depois de escalar de novo os 5 titulares.</p>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-end border-none">
                        <Button
                            type="button"
                            className="bg-background text-foreground border border-border hover:bg-muted"
                            onClick={() => {
                                onCancel?.();
                                onOpenChange?.(false);
                            }}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            className="bg-primary text-destructive-foreground hover:bg-primary-soft-foreground flex items-center gap-2"
                            disabled={changing}
                            onClick={() => {
                                void changePlayerCondition(player.id, selectedCondition);
                            }}>
                            {changing ? "Salvando..." : "Salvar Condição"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}