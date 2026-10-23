"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGetClub, ClubPlayerItem } from "../hooks/useGetClub";
import { IconContainer } from "@/components/ui/icon-container";
import { Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getPlayerAvatarClass,
  getPlayerInitials,
} from "../lib/utils";
import { DialogSell } from "./dialogSell";

const conditionClasses: Record<string, string> = {
  APTO: "border-success-soft-border bg-success-soft text-success-soft-foreground",
  Apto: "border-success-soft-border bg-success-soft text-success-soft-foreground",
  MAL_CONDICIONADO:
    "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
  "Mal condicionado":
    "border-warning-soft-border bg-warning-soft text-warning-soft-foreground",
  DOENTE:
    "border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground",
  Doente:
    "border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground",
};

function ConditionBadge({ condition }: { condition: string }) {
  const badgeStyle = conditionClasses[condition] || conditionClasses["APTO"];
  const label =
    condition === "MAL_CONDICIONADO"
      ? "Mal condicionado"
      : condition === "DOENTE"
        ? "Doente"
        : "Apto";

  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-lg border px-2 caption-xs-medium font-medium whitespace-nowrap ${badgeStyle}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function ClubPlayersTable() {
  const params = useParams();
  const clubId = Number(params?.id); // Captura o ID do clube da URL

  const { getClub, club, loading, error } = useGetClub(clubId);
  const [playerToSell, setPlayerToSell] = useState<ClubPlayerItem | null>(null);

  useEffect(() => {
    if (clubId) {
      void getClub(clubId);
    }
  }, [clubId, getClub]);

  const players = club?.players ?? [];

  return (
    <section className="w-full overflow-hidden rounded-xl border border-border bg-card">
      <header>
        <div className="flex flex-col items-start py-3.5 px-4 text-sm">
          <span className="heading-card">Elenco do Clube</span>
          <p className="caption-xs text-muted-foreground">
            Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome.
            Contrato calculado para uma venda agora.
          </p>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-280 border-collapse body-sm-medium">
          <thead className="bg-muted text-muted-foreground">
            <tr className="h-10 border-b border-border body-sm-medium">
              <th className="w-auto px-4 text-left">Jogador</th>
              <th className="w-20 px-2 text-center">Posição</th>
              <th className="w-16 px-2 text-right">Overall</th>
              <th className="w-33 px-2 text-center">Condição</th>
              <th className="w-33 px-2 text-right">Valor de mercado</th>
              <th className="w-28 px-2 text-right">Valor de compra</th>
              <th className="w-28 px-2 text-center">Fim Fidelidade</th>
              <th className="w-20 px-2 text-right">Dias Rest.</th>
              <th className="w-20 px-2 text-right">% Multa</th>
              <th className="w-28 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="h-28 text-center text-muted-foreground"
                >
                  Carregando elenco...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={10} className="h-28 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : players.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <IconContainer className="bg-muted border border-border h-12 w-12 flex items-center justify-center rounded-xl">
                      <Users size={24} className="text-muted-foreground" />
                    </IconContainer>
                    <p className="heading-card text-foreground font-semibold mt-1">
                      Elenco Vazio
                    </p>
                    <p className="body-sm text-muted-foreground max-w-sm">
                      Este clube ainda não possui nenhum jogador contratado.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              players.map((player) => {
                const initials = getPlayerInitials(player.name);
                const avatarClass = getPlayerAvatarClass(player.name);

                return (
                  <tr
                    key={player.id}
                    className="h-14 border-b border-border last:border-b-0"
                  >
                    <td className="px-4 text-left">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${avatarClass} caption-xs-medium`}
                        >
                          {initials}
                        </span>
                        <span className="flex flex-col whitespace-nowrap">
                          <span className="font-medium leading-5 text-foreground">
                            {player.name}
                          </span>
                        </span>
                      </div>
                    </td>

                    <td className="px-2 text-center">
                      <span className="inline-flex rounded-lg border border-border px-2 py-0.5 caption-xs">
                        {player.position}
                      </span>
                    </td>

                    <td className="px-2 text-right body-sm-semibold">
                      {player.overall}
                    </td>
                    <td className="px-2 text-center">
                      <ConditionBadge condition={player.condition} />
                    </td>
                    <td className="px-2 text-right body-sm-semibold">
                      R$ {player.marketValue.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="px-2 text-right body-sm">
                      {player.contract?.purchaseValue !== undefined ? (
                        `R$ ${player.contract.purchaseValue.toFixed(2).replace(".", ",")}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 text-center caption-xs text-muted-foreground">
                      {formatDate(player.contract?.loyaltyUntil)}
                    </td>
                    <td className="px-2 text-right body-sm">
                      {player.contract?.remainingDays ?? 0}d
                    </td>

                    <td className="px-2 text-right body-sm-semibold text-warning-soft-foreground">
                      {player.contract?.penaltyRate ?? 0}%
                    </td>

                    <td className="px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPlayerToSell(player)}
                        className="h-8 gap-1.5 border-border hover:bg-muted"
                      >
                        <Tag size={14} />
                        Vender
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação de Venda */}
      {playerToSell && (
        <DialogSell
          open={!!playerToSell}
          onOpenChange={(open) => !open && setPlayerToSell(null)}
          player={playerToSell}
          onConfirm={() => {
            setPlayerToSell(null);
            getClub(clubId);
          }}
        />
      )}
    </section>
  );
}
