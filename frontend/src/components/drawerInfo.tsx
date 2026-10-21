import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Player } from "../hooks/useTableData";
import { useIsMobile } from "@/hooks/use-mobile";
import { CardPlayer } from "@/components/ui/card-player";
import { CardInfos } from "@/components/ui/card-infos";
import { ChartColumn, Coins, HeartPulse, Pencil, ShoppingCart, Tag, TrendingUp } from "lucide-react";
import { useGetPlayer } from "../hooks/useGetPlayer";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatsDrawer } from "./statsDrawer";
import { DialogCondition } from "./dialogCondition";
import { DialogEdit } from "./dialogEdit";

interface DrawerInfoProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    player: Player;
}

export function DrawerInfo({ open, onOpenChange, player }: DrawerInfoProps) {
    const isMobile = useIsMobile()
    const { getPlayer, playerData, loading, error } = useGetPlayer()
    const [playerEdited, setPlayerEdited] = useState<Player | null>(null);
    const [playerConditionChanged, setPlayerConditionChanged] = useState<Player | null>(null);

    useEffect(() => {
        if (open && player?.id) {
            getPlayer(player.id)
        }
    }, [getPlayer, open, player.id]);

    if (!player) return null;

    const activeData = playerData ? {
        ...player,
        pace: playerData.pace,
        shooting: playerData.shooting,
        passing: playerData.passing,
        dribbling: playerData.dribbling,
        defending: playerData.defending,
        physical: playerData.physical,
        potential: playerData.potential,
        overall: playerData.overall,
        baseValue: playerData.base_value,
        marketValue: playerData.market_value,
        clubName: playerData.club_name ?? player.clubName,
        clubCode: playerData.club_code ?? player.clubCode,
    } : player;

    return (
        <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle={isMobile} swipeDirection={isMobile ? "down" : "right"}>
            <DrawerContent className="flex max-h-full flex-col border-none px-6">
                <DrawerHeader>
                    <DrawerTitle>
                        <CardPlayer player={activeData}></CardPlayer>
                    </DrawerTitle>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto py-4 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
                    {loading ? (
                        <div className="py-12 text-center body-sm text-muted-foreground">
                            Carregando informações do jogador...
                        </div>
                    ) : error ? (
                        <div className="py-6 text-center body-sm text-destructive">
                            {error}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-4">
                                <CardInfos
                                    title="Valor Mercado"
                                    icon={<Coins size={16} />}
                                    bigNumber={player.marketValue}
                                    description="Calculado automaticamente" />
                                <CardInfos
                                    title="Valor base"
                                    icon={<Tag size={16} />}
                                    bigNumber={player.baseValue}
                                    description="Calculado no cadastro" />
                                <CardInfos
                                    title="Overall"
                                    icon={<ChartColumn size={16} />}
                                    bigNumber={player.overall}
                                    description="Calculado pela posição" />
                                <CardInfos
                                    title="Potencial"
                                    icon={<TrendingUp size={16} />}
                                    bigNumber={player.potential}
                                    description="Informado no cadastro" />
                            </div>
                            <div className="flex flex-col items-center justify-center gap-4 w-full">
                                <div className="flex flex-row w-full items-center justify-between">
                                    <p className="heading-card text-foreground">Indicadores Técnicos</p>
                                    <p className="caption-xs text-muted-foreground">Escala de 1 a 99</p>
                                </div>
                                <StatsDrawer stats={activeData} />
                            </div>
                            <div className="w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                                <div className="flex flex-row items-center justify-between gap-4 p-4">
                                    <p className="body-sm text-muted-foreground">Idade</p>
                                    <p className="body-sm-medium text-foreground">{player.age}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between gap-4 p-4">
                                    <p className="body-sm text-muted-foreground">Agilidade</p>
                                    <p className="body-sm-medium text-foreground">{player.agility}</p>
                                </div>
                                <div className="flex flex-row items-center justify-between gap-4 p-4">
                                    <p className="body-sm text-muted-foreground">Clube</p>
                                    <div className="body-sm-medium text-foreground">
                                        {activeData.clubName ? (
                                            <p>{activeData.clubName}</p>
                                        ) : (
                                            <p className="caption-xs-medium text-muted-foreground">
                                                Livre
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <DrawerFooter className="flex shrink-0 flex-col gap-2 border-t border-border bg-transparent py-4">
                    <div className="flex w-full flex-row gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 min-w-0 bg-background"
                            onClick={() => setPlayerEdited(player)}>
                            <Pencil size={16} />
                            <span className="truncate">Editar</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1 min-w-0 bg-background"
                            onClick={() => setPlayerConditionChanged(player)}>
                            <HeartPulse size={16} />
                            <span className="truncate">Alterar Condição</span>
                        </Button>
                        <Button
                            className="flex-1 min-w-0 bg-primary text-primary-foreground"
                            onClick={() => {

                            }}>
                            <ShoppingCart size={16} />
                            <span className="truncate">Comprar</span>
                        </Button>
                    </div>
                </DrawerFooter>
            </DrawerContent>
            {
                playerConditionChanged && (
                    <DialogCondition
                        open={!!playerConditionChanged}
                        onOpenChange={(open) => !open && setPlayerConditionChanged(null)}
                        player={playerConditionChanged}
                        onCancel={() => setPlayerConditionChanged(null)}
                        onConfirm={() => { setPlayerConditionChanged(null) }} />
                )}
            {
                playerEdited && (
                    <DialogEdit
                        open={!!playerEdited}
                        onOpenChange={(open) => !open && setPlayerEdited(null)}
                        player={playerEdited}
                        onConfirm={() => { setPlayerEdited(null) }} />
                )
            }
        </Drawer>

    )

}