"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserRound } from "lucide-react";
import { positions } from "../hooks/useCreatePlayer";
import { Player } from "../hooks/tableData";
import { useToastManager } from "@/components/ui/toast";
import { useEditPlayer } from "../hooks/useEditPlayer";

interface DialogEditProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => void;
    player: Player;
}

function NumericField({ id, label, value, min, max, onChange, hint }: {
    id: string;
    label: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    hint?: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>
            <Input
                id={id}
                name={id}
                type="number"
                min={min ?? 1}
                max={max ?? 99}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))} />
            {hint &&
                <p className="text-xs leading-4 text-muted-foreground">
                    {hint}
                </p>
            }
        </div>
    );
}

export function DialogEdit({ open, onOpenChange, onConfirm, player }: DialogEditProps) {
    const toastManager = useToastManager();

    const { form, saving, error, updateField, editPlayer } = useEditPlayer(player, {
        onSuccess: () => {
            const id = toastManager.add({
                type: "success",
                title: "Jogador editado",
                description: `As informações de${player.name} foram salvas`,
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

    const hasClub = Boolean(player?.clubId);


    function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();
        editPlayer(player.id);

    }

    if (!player) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100%-2rem)] p-6 sm:max-w-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="pr-8">
                        <DialogTitle className="heading leading-6">
                            Editar Jogador
                        </DialogTitle>
                        <DialogDescription>Edite nome, posição, idade e agilidade. Os demais dados não mudam</DialogDescription>
                    </DialogHeader>

                    <div className="my-4 max-h-[65vh] space-y-5 overflow-y-auto pr-1">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="player-name" className="body-sm-medium">Nome</label>
                            <div className="relative">
                                <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="player-name"
                                    className="pl-9"
                                    value={form.name}
                                    onChange={(event) => updateField("name", event.target.value)} placeholder="Nome do jogador" required />
                            </div>
                            <p className="caption-xs text-muted-foreground">De 3 a 100 caracteres, com pelo menos duas palavras e sem números.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="body-sm-medium">Posição</span>
                            <div className="grid grid-cols-5 gap-2">
                                {positions.map(([value, label]) => {
                                    const isSelected = form.position === value;
                                    const isDisabled = hasClub && !isSelected;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            disabled={isDisabled}
                                            onClick={() => updateField("position", value)}
                                            className={`flex flex-col items-center rounded-lg border px-1 py-2 transition-colors 
                                            ${form.position === value
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-border bg-background"} 
                                            ${isDisabled
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : "cursor-pointer"} 
                                            ${isSelected
                                                    ? "border-primary bg-primary/10 text-primary font-semibold"
                                                    : "border-border bg-background hover:bg-muted"}`}>
                                            <span className="body-sm-semibold">{value}</span>
                                            <span className="caption-xs text-muted-foreground">{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className={`caption-xs ${hasClub ? "text-warning" : "text-muted-foreground"}`}>Jogador com clube não muda de posição: as outras posições ficam desabilitadas.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <NumericField
                                id="age"
                                label="Idade"
                                value={form.age}
                                min={player.age}
                                max={45}
                                onChange={(value) => updateField("age", value)}
                                hint="De 16 a 45 anos." />
                            <NumericField
                                id="agility"
                                label="Agilidade"
                                min={1}
                                max={100}
                                value={form.agility}
                                onChange={(value) => updateField("agility", value)}
                                hint="De 1 a 100." />
                        </div>

                    </div>

                    {error && <p className="mb-3 body-sm text-destructive">{error}</p>}

                    <DialogFooter className="border-t border-border bg-transparent p-0 pt-4">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => onOpenChange?.(false)}>
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={saving}>{saving ? "Salvando..." : "Salvar jogador"}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}