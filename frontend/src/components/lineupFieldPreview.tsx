"use client";

import { Formation } from "@/src/hooks/useGetLineup";
import { getPlayerInitials } from "@/src/lib/utils";
import { Swords } from "lucide-react";

// Interface local para a vaga do campo
export interface LineupSlot {
    slotKey: string;
    label: string;
    allowedPositions: string[];
    player: {
        id: number;
        name: string;
        position: string;
        condition: string;
        overall: number;
        usedAttributeName: string;
        usedAttributeValue: number;
    } | null;
}

interface LineupFieldPreviewProps {
    formation: Formation;
    slots: LineupSlot[];
}

export function LineupFieldPreview({ formation, slots }: LineupFieldPreviewProps) {
    const getCoordinates = (index: number) => {
        if (index === 0) return { top: "85%", left: "50%" };

        switch (formation) {
            case "3-1":
                if (index === 1) return { top: "60%", left: "25%" };
                if (index === 2) return { top: "60%", left: "50%" };
                if (index === 3) return { top: "60%", left: "75%" };
                return { top: "25%", left: "50%" };

            case "2-2":
                if (index === 1) return { top: "65%", left: "30%" };
                if (index === 2) return { top: "65%", left: "70%" };
                if (index === 3) return { top: "30%", left: "30%" };
                return { top: "30%", left: "70%" };

            case "2-1-1":
                if (index === 1) return { top: "68%", left: "30%" };
                if (index === 2) return { top: "68%", left: "70%" };
                if (index === 3) return { top: "45%", left: "50%" };
                return { top: "20%", left: "50%" };

            case "1-2-1":
                if (index === 1) return { top: "70%", left: "50%" };
                if (index === 2) return { top: "45%", left: "30%" };
                if (index === 3) return { top: "45%", left: "70%" };
                return { top: "20%", left: "50%" };

            default:
                return { top: "50%", left: "50%" };
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col items-start gap-1">
                <h4 className="heading-card text-foreground">Em campo</h4>
                <p className="caption-xs text-muted-foreground">
                    Prévia da formação {formation}, do goleiro ao ataque.
                </p>
            </div>

            <div className="relative h-80 w-full overflow-hidden rounded-xl border border-emerald-800 bg-emerald-900 shadow-inner">
                <div className="absolute inset-x-0 top-1/2 h-0.5 border-b border-dashed border-emerald-700/60 -translate-y-1/2" />
                <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700/60" />
                <div className="absolute bottom-0 left-1/2 h-12 w-32 -translate-x-1/2 border-t border-x border-emerald-700/60 rounded-t-lg" />

                {slots.map((slot, idx) => {
                    const coords = getCoordinates(idx);
                    const player = slot.player;

                    return (
                        <div
                            key={slot.slotKey + idx}
                            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                            style={{ top: coords.top, left: coords.left }}
                        >
                            {player ? (
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="relative flex size-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md border-2 border-white">
                                        {getPlayerInitials(player.name)}
                                        {player.condition === "MAL_CONDICIONADO" && (
                                            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white font-bold">
                                                !
                                            </span>
                                        )}
                                    </div>
                                    <span className="max-w-16 truncate rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                                        {player.name.split(" ")[0]}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                    <div className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-emerald-300/60 bg-emerald-950/40 text-emerald-300/80">
                                        +
                                    </div>
                                    <span className="text-[10px] text-emerald-200/70 font-medium">
                                        {slot.label.split(" ")[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="caption-xs text-muted-foreground flex items-center gap-1.5">
                <Swords size={32}/>
                    Na partida, atacam os 3 jogadores de linha mais avançados e defendem o goleiro e os 2 mais recuados.
            </p>
        </div>
    );
}