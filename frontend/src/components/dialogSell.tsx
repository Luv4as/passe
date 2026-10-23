"use client";

import { ClubPlayerItem } from "../hooks/useGetClub";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardPlayer } from "@/components/ui/card-player";
import { Button } from "@/components/ui/button";
import { HandCoins, History, Info } from "lucide-react";
import { SellTransactionResponse, useSellPlayer } from "../hooks/useSellPlayer";
import { DialogSucess } from "./dialogSucess";
import { useState } from "react";
import {
  formatDate,
  getPlayerAvatarClass,
  getPlayerInitials,
} from "../lib/utils";
import { Player, PlayerCondition } from "../hooks/useTableData";

interface DialogSellProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  player: ClubPlayerItem;
}

export function DialogSell({
  open,
  onOpenChange,
  onConfirm,
  player,
}: DialogSellProps) {
  const [soldPlayer, setSoldPlayer] = useState<Player | null>(null);
  const [transaction, setTransaction] =
    useState<SellTransactionResponse | null>(null);

  const { sellPlayer, error, selling } = useSellPlayer({
    onSuccess: (response) => {
      setTransaction(response);

      const mappedCondition = (player.condition || "Apto") as PlayerCondition;

      const formattedPlayer: Player = {
        id: player.id,
        name: player.name,
        position: player.position,
        positionLabel: player.position,
        agility: player.agility,
        age: player.age,
        condition: mappedCondition,
        baseValue: player.baseValue,
        marketValue: player.marketValue,
        overall: player.overall,
        clubId: player.clubId,
        pace: player.pace,
        shooting: player.shooting,
        passing: player.passing,
        dribbling: player.dribbling,
        defending: player.defending,
        physical: player.physical,
        potential: player.potential,
        initials: getPlayerInitials(player.name),
        avatarClass: getPlayerAvatarClass(player.name),
      };

      setSoldPlayer(formattedPlayer);
    },
  });

  const handleConfirmSell = () => {
    void sellPlayer(player.id);
  };

  const purchaseValue = player.contract?.purchaseValue ?? 0;
  const marketValue = player.marketValue ?? 0;
  const penaltyRate = player.contract?.penaltyRate ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vender {player.name}?</DialogTitle>
            <DialogDescription>
              O jogador sai do elenco do CLUBE e volta a ficar livre.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
                <Info size={16} className="inline-block mr-2" />
                {error}
              </div>
            )}
            <CardPlayer player={player} marketValue={marketValue} />
            <div className="justify-between w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between gap-4 p-4">
                <p className="body-sm text-muted-foreground">Valor da compra</p>
                <p className="max-w-[65%] truncate text-right body-sm tracking-tight text-foreground">
                  {purchaseValue}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 p-4">
                <p className="body-sm text-muted-foreground">
                  Fim da fidelidade
                </p>
                <p className="max-w-[65%] truncate text-right body-sm tracking-tight text-foreground">
                  {formatDate(player.contract?.loyaltyUntil)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 p-4">
                <p className="body-sm text-muted-foreground">Dias restantes</p>
                <p className="max-w-[65%] truncate text-right body-sm tracking-tight text-foreground">
                  {player.contract?.remainingDays}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 p-4">
                <p className="body-sm text-muted-foreground">
                  % de multa se vender agora
                </p>
                <p className="max-w-[65%] truncate text-right body-sm tracking-tight text-foreground">
                  {penaltyRate}%
                </p>
              </div>
            </div>
            <div className=" flex flex-row items-center gap-3 px-3 py-2.5 w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              <Info size={16} />
              <p className="body-sm text-muted-foreground">
                A venda é pelo valor de mercado do momento. Multa (teto de
                10,00), lucro, comissão e crédito são calculados ao confirmar.
              </p>
            </div>
          </div>
          <DialogFooter className="border-none">
            <Button
              type="button"
              disabled={selling}
              variant={"outline"}
              onClick={() => onOpenChange?.(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={selling}
              onClick={() => {
                handleConfirmSell();
              }}
            >
              <HandCoins size={16} />
              Confirmar venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {soldPlayer && transaction && (
        <DialogSucess
          title="Venda concluída"
          description={`${soldPlayer.name} voltou a ficar livre e saiu da escalação.`}
          open={soldPlayer !== null && transaction !== null}
          player={soldPlayer}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSoldPlayer(null);
              setTransaction(null);
              onConfirm?.();
              onOpenChange?.(false);
            }
          }}
          primaryAction={{
            label: "Ver histórico",
            icon: <History size={16} />,
            onClick: () => {},
          }}
          metrics={
            transaction
              ? [
                  {
                    title: "Valor de compra",
                    subtitle: "",
                    value: transaction.purchase_value,
                  },
                  {
                    title: "Valor de venda",
                    subtitle: "Valor de mercado no momento da venda",
                    value: transaction.purchase_value,
                  },
                  {
                    title: "Dias restantes",
                    subtitle: "",
                    value: transaction.remaining_days,
                  },
                  {
                    title: "Multa",
                    subtitle: "10% do valor de venda, com teto de 10,00",
                    value: transaction.penalty.toFixed(2).replace(".", ","),
                  },
                  {
                    title: "Lucro",
                    subtitle: "",
                    value: transaction.profit.toFixed(2).replace(".", ","),
                  },
                  {
                    title: "Comissão",
                    subtitle: "10% do lucro até 10,00 + 20% do que passar",
                    value: transaction.fee.toFixed(2).replace(".", ","),
                  },
                  {
                    title: "Crédito no caixa",
                    subtitle: "Valor de venda − multa − comissão",
                    value: transaction.cash_change.toFixed(2).replace(".", ","),
                  },
                  {
                    title: "Contrato",
                    subtitle: "",
                    value: transaction.contract_status,
                  },
                  {
                    title: "Novo caixa do Águias FC",
                    subtitle: "",
                    value: transaction.club_cash.toFixed(2).replace(".", ","),
                  },
                ]
              : undefined
          }
        />
      )}
    </>
  );
}
