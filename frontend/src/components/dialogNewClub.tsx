import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Plus, Shield, Wallet } from "lucide-react";
import { ReactElement, useState } from "react";
import { useCreateClub } from "../hooks/useCreateClub";
import { useToastManager } from "@/components/ui/toast";

interface DialogNewClubProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactElement;
  onClubCreated?: () => void;
}

export function DialogNewClub({ children, onClubCreated }: DialogNewClubProps) {
  const [open, setOpen] = useState(false);
  const toastManager = useToastManager();

  const { form, saving, error, updateField, createClub } = useCreateClub({
    onSuccess: (club) => {
      const id = toastManager.add({
        type: "success",
        title: "Clube criado",
        description: `${club.name} (${club.acronym}) começa com 300,00 em caixa.`,
        actionProps: {
          onClick() {
            toastManager.close(id);
          },
        },
      });
      setOpen(false);
      onClubCreated?.();
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    createClub();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          children ?? (
            <Button>
              <Plus size={16} />
              Novo clube
            </Button>
          )
        }
      />
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-1/3">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="heading-dialog">Novo clube</DialogTitle>
            <DialogDescription>
              Informe o nome e a sigla do clube.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium flex items-center gap-2">
              <Info size={16} />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="club-name">Nome do clube</Label>
            <div className="relative ">
              <Shield
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="club-name"
                placeholder="Nome do clube"
                className="pl-9"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <p className="caption-xs text-muted-foreground">
              De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços,
              hífen e ponto. Não pode repetir outro clube.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="club-acronym">Sigla</Label>
            <Input
              className="uppercase"
              id="club-acronym"
              placeholder="EX: ABC"
              maxLength={3}
              value={form.acronym}
              onChange={(e) => updateField("acronym", e.target.value)}
              required
            ></Input>
            <p className="caption-xs text-muted-foreground">
              3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a
              primeira é a primeira letra do nome.
            </p>
          </div>
          <div className="flex flex-row gap-2 rounded-lg bg-muted border border-border p-3 body-sm text-muted-foreground items-center">
            <Wallet size={16} />O clube começa com 300,00 em caixa e sem
            jogadores.
          </div>
          <DialogFooter className="border-none">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
