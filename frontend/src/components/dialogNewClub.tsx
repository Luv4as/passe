"use client";

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
import { AlertCircle, Info, Plus, Shield, Wallet } from "lucide-react";
import { ReactElement, useMemo, useState } from "react";
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
  const [touched, setTouched] = useState(false);
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
      setTouched(false);
      onClubCreated?.();
    },
  });

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    const trimmedName = form.name.trim();
    if (trimmedName.length > 0) {
      if (trimmedName.length < 3 || trimmedName.length > 60) {
        errors.name = "Use de 3 a 60 caracteres.";
      } else {
        const words = trimmedName.split(/\s+/);
        if (words.length < 2 || words.length > 5) {
          errors.name = "Informe de 2 a 5 palavras.";
        }
      }
    } else if (touched) {
      errors.name = "Informe o nome do clube.";
    }

    const trimmedAcronym = form.acronym.trim().toUpperCase();
    if (trimmedAcronym.length > 0) {
      if (trimmedAcronym.length !== 3 || !/^[A-Z]{3}$/.test(trimmedAcronym)) {
        errors.acronym = "Informe exatamente 3 letras de A a Z.";
      }
    } else if (touched) {
      errors.acronym = "Informe a sigla do clube.";
    }

    return errors;
  }, [form, touched]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    createClub();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setTouched(false);
    }}>
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
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="heading-dialog">Novo clube</DialogTitle>
            <DialogDescription>
              {touched && hasErrors ? (
                <span className="font-medium text-destructive">
                  Corrija os campos destacados para salvar.
                </span>
              ) : (
                "Informe o nome e a sigla do clube."
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              <Info size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="club-name" className="body-sm-medium">
              Nome do clube
            </Label>
            <div className="relative">
              <Shield
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="club-name"
                placeholder="Nome do clube"
                className={`pl-9 ${
                  fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>
            {fieldErrors.name ? (
              <p className="caption-xs flex items-center gap-1 font-medium text-destructive">
                <AlertCircle size={12} className="shrink-0" />
                {fieldErrors.name}
              </p>
            ) : (
              <p className="caption-xs text-muted-foreground">
                De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="club-acronym" className="body-sm-medium">
              Sigla
            </Label>
            <Input
              id="club-acronym"
              className={`uppercase ${
                fieldErrors.acronym ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              placeholder="EX: ABC"
              maxLength={3}
              value={form.acronym}
              onChange={(e) => updateField("acronym", e.target.value.toUpperCase())}
            />
            {fieldErrors.acronym ? (
              <p className="caption-xs flex items-center gap-1 font-medium text-destructive">
                <AlertCircle size={12} className="shrink-0" />
                {fieldErrors.acronym}
              </p>
            ) : (
              <p className="caption-xs text-muted-foreground">
                3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome.
              </p>
            )}
          </div>

          <div className="body-sm flex flex-row items-center gap-2 rounded-lg border border-border bg-muted p-3 text-muted-foreground">
            <Wallet size={16} className="shrink-0" />
            O clube começa com 300,00 em caixa e sem jogadores.
          </div>

          <DialogFooter className="border-none pt-2">
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