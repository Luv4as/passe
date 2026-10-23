import { ClubPlayerItem } from "@/src/hooks/useGetClub";
import { Player } from "@/src/hooks/useTableData";
import { getPlayerAvatarClass, getPlayerInitials } from "@/src/lib/utils";

type CardPlayerType = Omit<Partial<Player>, "condition"> & 
  Pick<ClubPlayerItem, "name" | "position" | "age"> & {
    condition?: string;
    marketValue?: number;
    clubName?: string;
    clubCode?: string;
};

interface CardPlayerProps {
    player: CardPlayerType;
    marketValue?: number;
}

export function CardPlayer({ player, marketValue }: CardPlayerProps) {
    const initials = player.initials || getPlayerInitials(player.name);
    const positionLabel = player.positionLabel || player.position;
    const avatarClass = player.avatarClass || getPlayerAvatarClass(player.name);

    return (
        <div className="w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-row w-full justify-between gap-2 py-3 px-3.5">
                <div className="flex items-center gap-4">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full caption-xs-medium ${avatarClass}`}>
                        {initials}
                    </span>
                    <span className="flex flex-col whitespace-nowrap">
                        <span className="font-medium leading-5 text-foreground">
                            {player.name}
                        </span>
                        <span className="caption-xs-medium leading-4 text-muted-foreground">
                            {player.position} {positionLabel ? `· ${positionLabel}` : ""} · {player.age}
                        </span>
                    </span>
                </div>
                {marketValue !== undefined ? (
                    <div className="flex flex-col justify-end items-end whitespace-nowrap">
                        <p className="caption-xs text-muted-foreground">Valor de Mercado</p>
                        <span className="heading-card leading-4 text-foreground">
                            {marketValue.toFixed(2).replace(".", ",")}
                        </span>
                    </div>
                ) :
                    player.clubName ? (
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