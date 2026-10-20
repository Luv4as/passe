import { Player } from "@/src/hooks/tableData";

export function CardPlayer({ player }: { player: Player }) {
    return (
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
    )
}