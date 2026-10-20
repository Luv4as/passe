"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Info, LockKeyhole, Plus, UserRound } from "lucide-react";
import { ReactElement, useState } from "react";
import { StatsPreview } from "./statsPreview";
import { DialogCreated } from "./dialogCreated";
import { positions, useCreatePlayer, type CreatedPlayer } from "@/src/hooks/useCreatePlayer";

function NumericField({ id, label, value, onChange, hint }: {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    hint?: string;
}) {
    return (
        <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
            <Input id={id} name={id} type="number" min={1} max={99} value={value} onChange={(event) => onChange(Number(event.target.value))} />
            {hint && <p className="text-xs leading-4 text-muted-foreground">{hint}</p>}
        </div>
    );
}

interface DialogNewPlayerProps {
    children?: ReactElement;
    onPlayerCreated?: () => void;
}

export function DialogNewPlayer({ children, onPlayerCreated }: DialogNewPlayerProps) {
    const [open, setOpen] = useState(false);
    const [createdPlayer, setCreatedPlayer] = useState<CreatedPlayer | null>(null);
    const { form, saving, error, updateField, createPlayer } = useCreatePlayer({
        onSuccess: (player) => {
            setOpen(false);
            setCreatedPlayer(player);
            onPlayerCreated?.();
        },
    });

    function handleSubmit(event: React.SubmitEvent) {
        event.preventDefault();
        createPlayer();
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={children ?? (
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Jogador
                    </Button>
                )} />
                <DialogContent className="max-w-[calc(100%-2rem)] p-6 sm:max-w-213">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="pr-8">
                        <DialogTitle className="text-lg font-semibold leading-6">Novo jogador</DialogTitle>
                        <DialogDescription>Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar.</DialogDescription>
                    </DialogHeader>

                    <div className="my-4 max-h-[65vh] space-y-5 overflow-y-auto pr-1">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="player-name" className="text-sm font-medium">Nome</label>
                            <div className="relative">
                                <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input id="player-name" className="pl-9" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Nome do jogador" required />
                            </div>
                            <p className="text-xs text-muted-foreground">De 3 a 100 caracteres, com pelo menos duas palavras e sem números.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">Posição</span>
                            <div className="grid grid-cols-5 gap-2">
                                {positions.map(([value, label]) => (
                                    <button key={value} type="button" onClick={() => updateField("position", value)} className={`flex flex-col items-center rounded-lg border px-1 py-2 ${form.position === value ? "border-primary bg-primary/5 text-primary" : "border-border bg-background"}`}>
                                        <strong className="text-sm">{value}</strong>
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <NumericField id="age" label="Idade" value={form.age} onChange={(value) => updateField("age", value)} hint="De 16 a 45 anos." />
                            <NumericField id="agility" label="Agilidade" value={form.agility} onChange={(value) => updateField("agility", value)} hint="De 1 a 100." />
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Valor base (moedas)</span>
                                <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-border bg-muted px-3 text-sm text-muted-foreground"><LockKeyhole size={14} />Após salvar</div>
                                <p className="text-xs text-muted-foreground">Calculado no cadastro.</p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <h3 className="text-base font-semibold">Indicadores técnicos</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis atributos não pode passar de 480.</p>
                        </div>

                        <div className="flex flex-col gap-4 lg:flex-row">
                            <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3">
                                <NumericField id="pace" label="Velocidade" value={form.pace} onChange={(value) => updateField("pace", value)} />
                                <NumericField id="shooting" label="Finalização" value={form.shooting} onChange={(value) => updateField("shooting", value)} />
                                <NumericField id="passing" label="Passe" value={form.passing} onChange={(value) => updateField("passing", value)} />
                                <NumericField id="dribbling" label="Drible" value={form.dribbling} onChange={(value) => updateField("dribbling", value)} />
                                <NumericField id="defending" label="Defesa" value={form.defending} onChange={(value) => updateField("defending", value)} />
                                <NumericField id="physical" label="Físico" value={form.physical} onChange={(value) => updateField("physical", value)} />
                                <NumericField id="potential" label="Potencial" value={form.potential} onChange={(value) => updateField("potential", value)} hint="≥ maior atributo; igual a ele com 33+ anos" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Overall</span>
                                    <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-border bg-muted px-3 text-sm text-muted-foreground"><LockKeyhole size={14} />Após salvar</div>
                                    <p className="text-xs text-muted-foreground">Calculado automaticamente.</p>
                                </div>
                            </div>
                            <StatsPreview stats={form} />
                        </div>
                    </div>

                    {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
                    <DialogFooter className="border-t border-border bg-transparent p-0 pt-4">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Info size={14} />O jogador começa livre e Apto.</div>
                            <div className="flex justify-end gap-2">
                                <DialogClose render={<Button variant="outline" type="button">Cancelar</Button>} />
                                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar jogador"}</Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
                </DialogContent>
            </Dialog>
            <DialogCreated
                player={createdPlayer}
                open={createdPlayer !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) setCreatedPlayer(null);
                }}
            />
        </>
    );
}