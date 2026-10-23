"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle, Eye, Info, LockKeyhole, Plus, UserRound } from "lucide-react";
import { ReactElement, useState, useMemo } from "react";
import { StatsPreview } from "./statsPreview";
import {
  positions,
  useCreatePlayer,
  type CreatedPlayer,
} from "@/src/hooks/useCreatePlayer";
import { DialogSucess } from "./dialogSucess";
import { Player, PlayerCondition } from "../hooks/useTableData";
import { DrawerInfo } from "./drawerInfo";

function mapCreatedPlayerToPlayer(created: CreatedPlayer): Player {
  const nameParts = created.name.trim().split(" ");
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0].substring(0, 2).toUpperCase();

  const positionLabels: Record<string, string> = {
    GOL: "Goleiro",
    ZAG: "Zagueiro",
    LAT: "Lateral",
    MEI: "Meio-campo",
    ATA: "Atacante",
  };

  return {
    id: created.id,
    name: created.name,
    initials: initials,
    position: created.position,
    positionLabel: positionLabels[created.position] || created.position,
    avatarClass: "bg-primary/10 text-primary font-bold",
    age: created.age,
    condition: (created.condition as PlayerCondition) ?? "APTO",
    marketValue: created.market_value,
    baseValue: created.base_value,
    overall: created.overall,
    potential: created.potential,
    agility: created.agility,
    pace: created.pace,
    shooting: created.shooting,
    passing: created.passing,
    dribbling: created.dribbling,
    defending: created.defending,
    physical: created.physical,
    clubId: created.club_id ?? null,
    clubName: created.club_name ?? undefined,
    clubCode: created.club_code ?? undefined,
  };
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
        <p className="caption-xs flex items-center gap-1 text-destructive font-medium">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="caption-xs leading-4 text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

interface DialogNewPlayerProps {
  children?: ReactElement;
  onPlayerCreated?: () => void;
}

export function DialogNewPlayer({
  children,
  onPlayerCreated,
}: DialogNewPlayerProps) {
  const [open, setOpen] = useState(false);
  const [createdPlayer, setCreatedPlayer] = useState<CreatedPlayer | null>(null);
  const [drawerPlayer, setDrawerPlayer] = useState<Player | null>(null);
  const [touched, setTouched] = useState(false);

  const { form, saving, updateField, createPlayer } = useCreatePlayer({
    onSuccess: (player) => {
      setOpen(false);
      setCreatedPlayer(player);
      onPlayerCreated?.();
    },
  });

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (form.name.trim().length > 0 && form.name.trim().length < 3) {
      errors.name = "Use de 3 a 100 caracteres.";
    }

    if (form.age < 16 || form.age > 45) {
      errors.age = "Use uma idade de 16 a 45 anos.";
    }

    const statsKeys = ["pace", "shooting", "passing", "dribbling", "defending", "physical"] as const;
    statsKeys.forEach((key) => {
      if (form[key] < 1 || form[key] > 99) {
        errors[key] = "Use um valor de 1 a 99.";
      }
    });

    if (!form.potential) {
      errors.potential = "Informe o potencial.";
    } else if (form.potential < 1 || form.potential > 99) {
      errors.potential = "Use um valor de 1 a 99.";
    }

    return errors;
  }, [form]);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    createPlayer();
  }

  function handleOpenDrawer() {
    if (!createdPlayer) return;
    const mappedPlayer = mapCreatedPlayerToPlayer(createdPlayer);
    setDrawerPlayer(mappedPlayer);
    setCreatedPlayer(null);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            children ?? (
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Jogador
              </Button>
            )
          }
        />
        <DialogContent className="max-w-[calc(100%-2rem)] p-6 sm:max-w-213">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="pr-8">
              <DialogTitle className="heading leading-6">
                Novo jogador
              </DialogTitle>
              <DialogDescription>
                {touched && hasErrors ? (
                  <span className="text-destructive font-medium">
                    Corrija os campos destacados para salvar.
                  </span>
                ) : (
                  "Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar."
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 max-h-[65vh] space-y-5 overflow-y-auto pr-1 no-scrollbar">
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
                    className={`pl-9 ${fieldErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Nome do jogador"
                  />
                </div>
                {fieldErrors.name ? (
                  <p className="caption-xs flex items-center gap-1 text-destructive font-medium">
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
                  {positions.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateField("position", value)}
                      className={`flex flex-col items-center rounded-lg border px-1 py-2 ${
                        form.position === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background"
                      }`}
                    >
                      <strong className="body-sm">{value}</strong>
                      <span className="caption-xs text-muted-foreground">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <NumericField
                  id="age"
                  label="Idade"
                  value={form.age}
                  onChange={(value) => updateField("age", value)}
                  error={fieldErrors.age}
                  hint="De 16 a 45 anos."
                />
                <NumericField
                  id="agility"
                  label="Agilidade"
                  value={form.agility}
                  onChange={(value) => updateField("agility", value)}
                  error={fieldErrors.agility}
                  hint="De 1 a 100 (até 85 com 35 anos ou mais)."
                />
                <div className="flex flex-col gap-2">
                  <span className="body-sm-medium text-muted-foreground">
                    Valor base (moedas)
                  </span>
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-border bg-muted px-3 body-sm text-muted-foreground">
                    <LockKeyhole size={14} />
                    Após salvar
                  </div>
                  <p className="caption-xs text-muted-foreground">
                    Calculado no cadastro.
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="heading">Indicadores técnicos</h3>
                <p className="mt-1 body-sm text-muted-foreground">
                  Seis atributos e o potencial, de 1 a 99. Não mudam depois do
                  cadastro; a soma dos seis atributos não pode passar de 480.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3">
                  <NumericField
                    id="pace"
                    label="Velocidade"
                    value={form.pace}
                    onChange={(value) => updateField("pace", value)}
                    error={fieldErrors.pace}
                  />
                  <NumericField
                    id="shooting"
                    label="Finalização"
                    value={form.shooting}
                    onChange={(value) => updateField("shooting", value)}
                    error={fieldErrors.shooting}
                  />
                  <NumericField
                    id="passing"
                    label="Passe"
                    value={form.passing}
                    onChange={(value) => updateField("passing", value)}
                    error={fieldErrors.passing}
                  />
                  <NumericField
                    id="dribbling"
                    label="Drible"
                    value={form.dribbling}
                    onChange={(value) => updateField("dribbling", value)}
                    error={fieldErrors.dribbling}
                  />
                  <NumericField
                    id="defending"
                    label="Defesa"
                    value={form.defending}
                    onChange={(value) => updateField("defending", value)}
                    error={fieldErrors.defending}
                  />
                  <NumericField
                    id="physical"
                    label="Físico"
                    value={form.physical}
                    onChange={(value) => updateField("physical", value)}
                    error={fieldErrors.physical}
                  />
                  <NumericField
                    id="potential"
                    label="Potencial"
                    value={form.potential}
                    onChange={(value) => updateField("potential", value)}
                    error={fieldErrors.potential}
                    hint="≥ maior atributo; igual a ele com 33+ anos"
                  />
                  <div className="flex flex-col gap-2">
                    <span className="body-sm-medium text-muted-foreground">
                      Overall
                    </span>
                    <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-border bg-muted px-3 body-sm text-muted-foreground">
                      <LockKeyhole size={14} />
                      Após salvar
                    </div>
                    <p className="caption-xs text-muted-foreground">
                      Calculado automaticamente.
                    </p>
                  </div>
                </div>
                <StatsPreview stats={form} />
              </div>
            </div>

            <DialogFooter className="border-t border-border bg-transparent p-0 pt-4">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 caption-xs text-muted-foreground">
                  <Info size={14} />O jogador começa livre e Apto.
                </div>
                <div className="flex justify-end gap-2">
                  <DialogClose
                    render={
                      <Button variant="outline" type="button">
                        Cancelar
                      </Button>
                    }
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar jogador"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DialogSucess
        title="Jogador cadastrado"
        description={`${createdPlayer?.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
        player={createdPlayer}
        open={createdPlayer !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setCreatedPlayer(null);
        }}
        primaryAction={{
          label: "Ver detalhes",
          icon: <Eye size={16} />,
          onClick: () => handleOpenDrawer(),
        }}
        closeText="Fechar"
      />

      {drawerPlayer && (
        <DrawerInfo
          open={drawerPlayer !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDrawerPlayer(null);
          }}
          player={drawerPlayer}
        />
      )}
    </>
  );
}