"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { positions } from "../hooks/useCreatePlayer";
import { Player } from "../hooks/useTableData";
import { useToastManager } from "@/components/ui/toast";
import { useEditPlayer } from "../hooks/useEditPlayer";

interface DialogEditProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  player: Player;
}

function NumericField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="body-sm-medium text-foreground">
        {label}
      </label>
      <Input
        id={id}
        name={id}
        type="number"
        value={value || ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {error ? (
        <p className="caption-xs flex items-center gap-1 font-medium text-destructive">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="caption-xs leading-4 text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function DialogEdit({
  open,
  onOpenChange,
  onConfirm,
  player,
}: DialogEditProps) {
  const toastManager = useToastManager();
  const [touched, setTouched] = useState(false);

  const { form, saving, error, updateField, editPlayer } = useEditPlayer(
    player,
    {
      onSuccess: () => {
        const id = toastManager.add({
          type: "success",
          title: "Jogador editado",
          description: `As informações de ${player.name} foram salvas`,
          actionProps: {
            onClick() {
              toastManager.close(id);
            },
          },
        });
        onConfirm?.();
        onOpenChange?.(false);
      },
    },
  );

  const hasClub = Boolean(player?.clubId);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (form.name.trim().length > 0 && form.name.trim().length < 3) {
      errors.name = "Use de 3 a 100 caracteres.";
    }

    const minAge = player?.age ?? 16;
    if (form.age < minAge || form.age > 45) {
      errors.age = `Use uma idade de ${minAge} a 45 anos.`;
    }

    if (form.agility < 1 || form.agility > 100) {
      errors.agility = "Use um valor de 1 a 100.";
    }

    return errors;
  }, [form, player]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    editPlayer(player.id);
  }

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] p-6 sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pr-8">
            <DialogTitle className="heading leading-6">
              Editar Jogador
            </DialogTitle>
            <DialogDescription>
              {touched && hasErrors ? (
                <span className="font-medium text-destructive">
                  Corrija os campos destacados para salvar.
                </span>
              ) : (
                "Edite nome, posição, idade e agilidade. Os demais dados não mudam."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 max-h-[65vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-col gap-2">
              <label htmlFor="player-name" className="body-sm-medium">
                Nome
              </label>
              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="player-name"
                  className={`pl-9 ${
                    fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Nome do jogador"
                  required
                />
              </div>
              {fieldErrors.name ? (
                <p className="caption-xs flex items-center gap-1 font-medium text-destructive">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.name}
                </p>
              ) : (
                <p className="caption-xs text-muted-foreground">
                  De 3 a 100 caracteres, com pelo menos duas palavras e sem números.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="body-sm-medium">Posição</span>
              <div className="grid grid-cols-5 gap-2">
                {positions.map(([value, label]) => {
                  const isSelected = form.position === value;
                  const isDisabled = hasClub && !isSelected;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => updateField("position", value)}
                      className={`flex flex-col items-center rounded-lg border px-1 py-2 transition-colors ${
                        isDisabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-muted"
                      } ${
                        isSelected
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border bg-background"
                      }`}
                    >
                      <span className="body-sm-semibold">{value}</span>
                      <span className="caption-xs text-muted-foreground">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p
                className={`caption-xs ${
                  hasClub ? "text-warning" : "text-muted-foreground"
                }`}
              >
                Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <NumericField
                id="age"
                label="Idade"
                value={form.age}
                onChange={(value) => updateField("age", value)}
                error={fieldErrors.age}
                hint={`De ${player.age} a 45 anos.`}
              />
              <NumericField
                id="agility"
                label="Agilidade"
                value={form.agility}
                onChange={(value) => updateField("agility", value)}
                error={fieldErrors.agility}
                hint="De 1 a 100."
              />
            </div>
          </div>

          {error && <p className="mb-3 body-sm text-destructive">{error}</p>}

          <DialogFooter className="border-t border-border bg-transparent p-0 pt-4">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange?.(false)}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar jogador"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}