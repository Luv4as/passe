import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ComboboxOptions } from "./comboboxOptions";
import { FieldDescription } from "@/components/ui/field";
import { Info, Plus, Shield, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToastManager } from "@/components/ui/toast";
import { useCreateMatch } from "../hooks/useCreateMatch";
import { ReactElement, useEffect, useState } from "react";
import { useGetClubs } from "../hooks/useGetClubs";

interface DialogNewMatchProps {
  children?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMatchCreated?: () => void;
}

export function DialogNewMatch({
  children,
  open: controlledOpen,
  onOpenChange,
  onMatchCreated,
}: DialogNewMatchProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  function handleOpenChange(newOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }

  const toastManager = useToastManager();
  const { getClubs, clubs, loading: loadingClubs } = useGetClubs();

  const { form, saving, error, updateField, createMatch } = useCreateMatch({
    onSuccess: (match) => {
      const id = toastManager.add({
        type: "success",
        title: "Partida jogada",
        description: `${match.home.club_name} ${match.home.goals} X ${match.away.goals} (${match.away.club_name}). Placar e duelos devolvidos pela API.`,
        actionProps: {
          onClick() {
            toastManager.close(id);
          },
        },
      });
      handleOpenChange(false);
      onMatchCreated?.();
    },
  });

  useEffect(() => {
    if (open) {
      getClubs();
    }
  }, [open, getClubs]);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    createMatch();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          children ?? (
            <Button>
              <Plus size={16} />
              Nova partida
            </Button>
          )
        }
      />
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="heading">Nova partida</DialogTitle>
            <DialogDescription>
              Escolha o mandante e o visitante. O placar sai dos atributos dos
              titulares, sem sorteio.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
                <Info size={16} className="inline-block mr-2" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="home-club">Mandante</Label>
              <ComboboxOptions
                icon={<Shield size={16} />}
                placeholder={
                  loadingClubs
                    ? "Carregando clubes..."
                    : "Selecione o clube mandante"
                }
                opcoes={clubs}
                value={form.homeClubId ? form.homeClubId.toString() : ""}
                onValueChange={(clubId) =>
                  updateField("homeClubId", Number(clubId))
                }
              />
              <FieldDescription>Faz os 3 primeiros ataques.</FieldDescription>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label>Visitante</Label>
              <ComboboxOptions
                icon={<Shield size={16} />}
                placeholder={
                  loadingClubs
                    ? "Carregando clubes..."
                    : "Selecione o clube visitante"
                }
                opcoes={clubs}
                value={form.awayClubId ? form.awayClubId.toString() : ""}
                onValueChange={(clubId) =>
                  updateField("awayClubId", Number(clubId))
                }
              />
              <FieldDescription>
                Precisa ser um clube diferente do mandante.
              </FieldDescription>
            </div>

            <div className=" flex flex-col items-start gap-3 px-3 py-2.5 w-full overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex flex-row items-center gap-2">
                <Info size={16} />
                <p className="body-sm-medium">Como sai o placar</p>
              </div>
              <p className="body-sm text-muted-foreground">
                Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de
                linha vão do 1º (o mais recuado) ao 4º (o mais avançado): o 4º
                enfrenta o goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do
                adversário. O atacante usa finalização (ATA), passe (MEI) ou
                drible (ZAG e LAT), e quem defende usa defesa. É gol só quando o
                ataque é maior; mal condicionado joga com 15% a menos.
              </p>
              <p className="body-sm text-muted-foreground">
                Os dois clubes precisam ter os 5 titulares escalados. A partida
                não mexe no caixa.
              </p>
            </div>
            {saving && (
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
              disabled={saving}
              onClick={() => handleOpenChange?.(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.homeClubId || !form.awayClubId}
              className="ml-2"
            >
              <Swords size={16} />
              Jogar partida
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
