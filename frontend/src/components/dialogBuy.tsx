"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Player } from "../hooks/useTableData";
import { CardPlayer } from "@/components/ui/card-player";
import {
  ArrowRight,
  Calendar,
  Clock,
  Info,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { ClubItem, useGetClubs } from "../hooks/useGetClubs";
import { BuyTransactionResponse, useBuyPlayer } from "../hooks/useBuyPlayer";
import { useEffect, useState } from "react";
import { ComboboxOptions } from "./comboboxOptions";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogSucess } from "./dialogSucess";
import { formatCoins, formatDate } from "../lib/utils";
import { useRouter } from "next/navigation";

interface DialogBuyProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  player: Player;
}

export function DialogBuy({
  open,
  onOpenChange,
  onConfirm,
  player,
}: DialogBuyProps) {
  const router = useRouter();
  const { getClubs, clubs, loading: loadingClubs } = useGetClubs();
  const [boughtPlayer, setBoughtPlayer] = useState<Player | null>(null);
  const [transaction, setTransaction] = useState<BuyTransactionResponse | null>(
    null,
  );
  const [purchasingClub, setPurchasingClub] = useState<ClubItem | null>(null);

  const { form, updateField, buyPlayer, error, buying } = useBuyPlayer(player, {
    onSuccess: (data) => {
      const currentClub = clubs.find((c) => c.id === form.clubId) ?? null;
      setPurchasingClub(currentClub);
      setTransaction(data);
      setBoughtPlayer(player);
    },
  });

  useEffect(() => {
    if (open) getClubs();
  }, [open, getClubs]);

  if (!player) return null;
  if (loadingClubs) return null;

  const selectedClub = clubs.find((c) => c.id === form.clubId);
  const hasEnoghCash = selectedClub
    ? selectedClub.cash >= player.marketValue
    : true;

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    buyPlayer();
  }

  const totalCost = transaction ? transaction.value + transaction.fee : 0;

  return (
    <>
      {player && !loadingClubs && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="heading">Comprar jogador</DialogTitle>
                <DialogDescription>
                  Escolha o clube comprador e até quando vai a fidelidade do
                  contrato.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
                    <Info size={16} className="inline-block mr-2" />
                    <div className="flex flex-col gap-1">
                      <p>Compra Recusada</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                <CardPlayer
                  player={player}
                  marketValue={player.marketValue}
                ></CardPlayer>
                <div className="flex flex-col gap-2 w-full">
                  <Label>Clube comprador</Label>
                  <ComboboxOptions
                    icon={<Shield size={16} />}
                    placeholder={
                      loadingClubs
                        ? "Carregando clubes..."
                        : "Selecione o clube comprador"
                    }
                    opcoes={clubs}
                    value={form.clubId ? form.clubId.toString() : ""}
                    onValueChange={(clubId) =>
                      updateField("clubId", Number(clubId))
                    }
                  />
                  <FieldDescription>
                    Caixa atual: 300,00. O custo total (valor + taxa) pode ir
                    até 50% do caixa.
                  </FieldDescription>
                  {selectedClub && !hasEnoghCash && (
                    <span className="text-warning-foreground caption-xs">
                      O clube selecionado não tem dinheiro suficiente para
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Label>Fim da fidelidade</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        type="date"
                        className="pl-9"
                        value={form.data}
                        onChange={(e) => updateField("data", e.target.value)}
                        required
                      />
                    </div>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                      <Input
                        type="time"
                        className="pl-9"
                        value={form.hora}
                        onChange={(e) => updateField("hora", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <span className="text-muted-foreground caption-xs">
                    Depois do momento da compra e até 1.095 dias. Horário de
                    Brasília; enviado com o fuso (-03:00).
                  </span>
                </div>
                <div className=" flex flex-row items-center gap-3 px-3 py-2.5 w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  <Info size={16} />
                  <p className="body-sm text-muted-foreground">
                    A taxa é de 5% do valor de mercado, só quando ele passa de
                    30,00. Taxa, custo e novo caixa são calculados ao confirmar.
                  </p>
                </div>
                {buying && (
                  <div className=" flex flex-row items-center gap-3 px-3 py-2.5 w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                    <Info size={16} />
                    <p className="body-sm text-muted-foreground">
                      Enviando a compra. Os botões ficam desabilitados até a
                      resposta.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="border-none mt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={buying}
                  onClick={() => onOpenChange?.(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={buying || !hasEnoghCash}
                  className="ml-2"
                >
                  <ShoppingCart size={16} />
                  Confirmar compra
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <DialogSucess
        title="Compra concluída"
        description={`${boughtPlayer?.name} agora é do Tubarões EC.`}
        open={boughtPlayer !== null && transaction !== null}
        player={boughtPlayer}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setBoughtPlayer(null);
            setTransaction(null);
            setPurchasingClub(null);
            onConfirm?.();
            onOpenChange?.(false);
          }
        }}
        primaryAction={{
          label: "Ver clube",
          icon: <ArrowRight size={16} />,
          onClick: () => {
            if (purchasingClub?.id) {
              router.push(`/market/clubs/${purchasingClub?.id}`);
            }
          },
        }}
        metrics={
          transaction
            ? [
              {
                title: "Valor",
                subtitle: "Valor de mercado no momento da compra",
                value: formatCoins(transaction.value),
              },
              {
                title: "Taxa",
                subtitle:
                  transaction.fee > 0
                    ? "5% do valor (passa de 30,00)"
                    : "Isento de taxa",
                value: formatCoins(transaction.fee),
              },
              {
                title: "Custo total",
                subtitle: "Valor + taxa",
                value: formatCoins(totalCost),
                highlighted: true,
              },
              {
                title: "Fim da fidelidade",
                subtitle: "Calculado pela API",
                value: formatDate(transaction.contract.loyalty_until),
              },
              {
                title: "Contrato",
                subtitle: "",
                value: transaction.contract.status,
              },
              {
                title: `Novo caixa do ${purchasingClub?.name}`,
                subtitle: "",
                value: formatCoins(transaction.club_cash),
                highlighted: true,
              },
            ]
            : undefined
        }
      />
    </>
  );
}
