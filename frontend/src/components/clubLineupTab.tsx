"use client";

import { useEffect, useState, useMemo } from "react";
import { ClubPlayerItem } from "@/src/hooks/useGetClub";
import { Formation, useGetLineup } from "@/src/hooks/useGetLineup";
import { useCreateLineup } from "../hooks/useCreateLineup";
import { LineupFieldPreview } from "./lineupFieldPreview";
import { LineupReserves } from "./lineupReserves";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Check } from "lucide-react";
import { useToastManager } from "@/components/ui/toast";
import { PlayerCondition } from "../hooks/useTableData";

interface ClubLineupTabProps {
    clubId: number;
    clubName: string;
    allPlayers: ClubPlayerItem[];
}

const FORMATIONS: { key: Formation; label: string; desc: string }[] = [
    { key: "3-1", label: "3-1", desc: "Defesa 3, ataque 1" },
    { key: "2-2", label: "2-2", desc: "Defesa 2, ataque 2" },
    { key: "2-1-1", label: "2-1-1", desc: "Defesa 2, meio 1, ataque 1" },
    { key: "1-2-1", label: "1-2-1", desc: "Defesa 1, meio 2, ataque 1" },
];

export function ClubLineupTab({ clubId, clubName, allPlayers }: ClubLineupTabProps) {
    const toastManager = useToastManager();

    const { lineup, loading, error: getError, getLineup } = useGetLineup(clubId);

    const { saveLineup, saving, error: saveError } = useCreateLineup({
        onSuccess: (updatedLineup) => {
            const id = toastManager.add({
                type: "success",
                title: "Escalação salva",
                description: `Formação ${updatedLineup.formation} aplicada com sucesso ao ${clubName}.`,
                actionProps: {
                    onClick() {
                        toastManager.close(id);
                    },
                },
            });
            void getLineup();
        },
    });

    const [formation, setFormation] = useState<Formation>("2-1-1");
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<(number | null)[]>([
        null, null, null, null, null,
    ]);

    const [prevLineup, setPrevLineup] = useState(lineup);

    const slotsConfig = useMemo(() => {
        switch (formation) {
            case "3-1":
                return [
                    { label: "Goleiro", pos: "GOL", allowed: ["GOL"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Ataque", pos: "ATA", allowed: ["ATA"] },
                ];
            case "2-2":
                return [
                    { label: "Goleiro", pos: "GOL", allowed: ["GOL"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Ataque", pos: "ATA ou MEI", allowed: ["ATA", "MEI"] },
                    { label: "Ataque", pos: "ATA ou MEI", allowed: ["ATA", "MEI"] },
                ];
            case "1-2-1":
                return [
                    { label: "Goleiro", pos: "GOL", allowed: ["GOL"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Meio", pos: "MEI", allowed: ["MEI"] },
                    { label: "Meio", pos: "MEI", allowed: ["MEI"] },
                    { label: "Ataque", pos: "ATA", allowed: ["ATA"] },
                ];
            case "2-1-1":
            default:
                return [
                    { label: "Goleiro", pos: "GOL", allowed: ["GOL"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Defesa", pos: "ZAG ou LAT", allowed: ["ZAG", "LAT"] },
                    { label: "Meio", pos: "MEI", allowed: ["MEI"] },
                    { label: "Ataque", pos: "ATA", allowed: ["ATA"] },
                ];
        }
    }, [formation]);

    useEffect(() => {
        if (clubId) void getLineup();
    }, [clubId, getLineup]);

    if (lineup !== prevLineup) {
        setPrevLineup(lineup);

        if (lineup) {
            if (lineup.formation) {
                setFormation(lineup.formation);
            }

            if (lineup.players && lineup.players.length > 0) {
                const newSelected: (number | null)[] = [null, null, null, null, null];
                const assignedIds = new Set<number>();

                slotsConfig.forEach((slot, index) => {
                    const match = lineup.players.find(
                        (p) => slot.allowed.includes(p.position) && !assignedIds.has(p.id)
                    );
                    if (match) {
                        newSelected[index] = match.id;
                        assignedIds.add(match.id);
                    }
                });

                setSelectedPlayerIds(newSelected);
            }
        }
    }

    const isComplete = useMemo(() => {
        return selectedPlayerIds.filter((id) => id !== null).length === 5;
    }, [selectedPlayerIds]);

    const malConditionedNames = useMemo(() => {
        return allPlayers
            .filter((p) => selectedPlayerIds.includes(p.id) && p.condition === "MAL_CONDICIONADO")
            .map((p) => p.name);
    }, [allPlayers, selectedPlayerIds]);

    const handleSelectSlotPlayer = (index: number, value: string) => {
        const newIds = [...selectedPlayerIds];
        newIds[index] = value === "VAZIO" ? null : Number(value);
        setSelectedPlayerIds(newIds);
    };

    const handleSave = async () => {
        const validPlayerIds = selectedPlayerIds.filter((id): id is number => id !== null);

        await saveLineup(clubId, {
            formation,
            player_ids: validPlayerIds,
        });
    };

    if (loading) {
        return <div className="py-8 text-center text-muted-foreground">Carregando escalação...</div>;
    }

    const activeError = saveError || getError;

    return (
        <div className="flex flex-col gap-4 w-full">
            {(!isComplete || activeError) && (
                <div className="flex flex-col gap-1 items-start rounded-xl border border-warning-soft-border bg-warning-soft p-3.5 text-warning-soft-foreground">
                    <div className="flex items-center gap-2 font-semibold body-sm">
                        <AlertTriangle size={16} className="text-warning-soft-foreground shrink-0" />
                        <span className="text-warning-soft-foreground body-sm-medium">Escalação incompleta: o {clubName} não pode jogar partidas</span>
                    </div>
                    <p className="body-sm text-warning-soft-foreground pl-6">
                        {activeError ||
                            `O elenco tem ${allPlayers.length} jogadores, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                <div className="lg:col-span-2 flex flex-col gap-5 rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <div className=" flex flex-col gap-0.5 items-start">
                            <h3 className="heading-card text-foreground">Titulares</h3>
                            <p className="caption-xs text-muted-foreground">
                                1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
                            </p>
                        </div>
                        {isComplete ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 caption-xs-medium text-success-soft-foreground border border-success-soft-border">
                                <Check size={12} /> Completa
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 caption-xs-medium text-warning-soft-foreground border border-warning-soft-border">
                                <AlertTriangle size={12} /> Incompleta
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="body-sm-medium text-foreground text-left">Formação</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {FORMATIONS.map((f) => (
                                <button
                                    key={f.key}
                                    type="button"
                                    onClick={() => setFormation(f.key)}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-colors ${formation === f.key
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-border bg-background hover:bg-muted"
                                        }`}
                                >
                                    <div className="flex size-4 items-center justify-center rounded-full border border-current">
                                        {formation === f.key && <div className="size-2 rounded-full bg-primary" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <strong className="body-sm">{f.label}</strong>
                                        <span className="caption-xs text-muted-foreground">{f.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabela dos 5 Titulares */}
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-left caption-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                                    <th className="py-2.5 px-3">Vaga</th>
                                    <th className="py-2.5 px-3">Titular</th>
                                    <th className="py-2.5 px-3">Condição</th>
                                    <th className="py-2.5 px-3 text-right">Overall</th>
                                    <th className="py-2.5 px-3">Atributos usados</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {slotsConfig.map((slot, index) => {
                                    const currentSelectedId = selectedPlayerIds[index];
                                    const selectedPlayer = allPlayers.find((p) => p.id === currentSelectedId);

                                    const availableForSlot = allPlayers.filter((p) => {
                                        const isAllowedPos = slot.allowed.includes(p.position);
                                        const isNotDoente = p.condition !== "DOENTE";
                                        const isNotChosenInOtherSlot =
                                            !selectedPlayerIds.includes(p.id) || p.id === currentSelectedId;
                                        return isAllowedPos && isNotDoente && isNotChosenInOtherSlot;
                                    });

                                    return (
                                        <tr key={index} className="hover:bg-muted/20">
                                            <td className="py-2.5 px-3 font-medium">
                                                <div className="body-sm text-foreground">{slot.label}</div>
                                                <div className="caption-xs text-muted-foreground">{slot.pos}</div>
                                            </td>

                                            <td className="py-2.5 px-3">
                                                <Select
                                                    value={currentSelectedId ? String(currentSelectedId) : "VAZIO"}
                                                    onValueChange={(val) => handleSelectSlotPlayer(index, val ?? "VAZIO")}
                                                >
                                                    <SelectTrigger className="w-52 h-8 caption-xs bg-background border-border">
                                                        <SelectValue>
                                                            {selectedPlayer
                                                                ? `${selectedPlayer.name} (${selectedPlayer.position})`
                                                                : `Sem ${slot.pos} selecionado`}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="VAZIO" className="caption-xs text-muted-foreground">
                                                            Sem {slot.pos} selecionado
                                                        </SelectItem>
                                                        {availableForSlot.map((p) => (
                                                            <SelectItem key={p.id} value={String(p.id)} className="caption-xs">
                                                                {p.name} ({p.position})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </td>

                                            <td className="py-2.5 px-3">
                                                {selectedPlayer ? (
                                                    selectedPlayer.condition === "MAL_CONDICIONADO" ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-warning-soft-border bg-warning-soft px-2 py-0.5 caption-xs-medium text-warning-soft-foreground">
                                                            • Mal condicionado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-success-soft-border bg-success-soft px-2 py-0.5 caption-xs-medium text-success-soft-foreground">
                                                            • Apto
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>

                                            <td className="py-2.5 px-3 text-right font-bold body-sm">
                                                {selectedPlayer?.overall ?? "—"}
                                            </td>

                                            <td className="py-2.5 px-3 text-muted-foreground">
                                                {selectedPlayer
                                                    ? slot.pos === "GOL"
                                                        ? `Defesa ${selectedPlayer.defending}`
                                                        : slot.label === "Ataque"
                                                            ? `Finalização ${selectedPlayer.shooting}`
                                                            : slot.label === "Meio"
                                                                ? `Passe ${selectedPlayer.passing}`
                                                                : `Defesa ${selectedPlayer.defending}`
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {malConditionedNames.length > 0 && (
                        <div className="flex flex-col gap-0.5 items-start rounded-xl border border-warning-soft-border bg-warning-soft p-3 text-warning-soft-foreground">
                            <div className="flex items-center gap-1.5 font-semibold body-sm">
                                <AlertTriangle size={15} className="text-warning-soft-foreground shrink-0" />
                                {malConditionedNames.join(" e ")}{" "}
                                {malConditionedNames.length > 1 ? "estão mal condicionados" : "está mal condicionado"}
                            </div>
                            <p className="caption-xs pl-5 text-warning-soft-foreground">
                                Podem jogar, mas cada atributo vale 15% a menos durante a partida.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border pt-4">
                        <span className="caption-xs text-muted-foreground max-w-xs">
                            A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela.
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => void getLineup()}>
                                Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving || !isComplete}>
                                {saving ? "Salvando..." : "Salvar escalação"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <LineupFieldPreview
                        formation={formation}
                        slots={slotsConfig.map((s, idx) => {
                            const pId = selectedPlayerIds[idx];
                            const p = allPlayers.find((item) => item.id === pId);
                            return {
                                slotKey: `slot-${idx}`,
                                label: s.label,
                                allowedPositions: s.allowed,
                                player: p
                                    ? {
                                        id: p.id,
                                        name: p.name,
                                        position: p.position,
                                        condition: p.condition as PlayerCondition,
                                        overall: p.overall,
                                        usedAttributeName: "Atributo",
                                        usedAttributeValue: 70,
                                    }
                                    : null,
                            };
                        })}
                    />

                    <LineupReserves allPlayers={allPlayers} selectedPlayerIds={selectedPlayerIds} />
                </div>
            </div>
        </div>
    );
}