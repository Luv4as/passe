import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

export interface RadioCardOption {
    value: string;
    label: string;
    description: string;
    isCurrent?: boolean;
}

interface RadioCardProps {
    options: RadioCardOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export function RadioCard({ options, value, defaultValue, onValueChange, className }: RadioCardProps) {
    return (
        <RadioGroup
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            className={`flex flex-col gap-3 ${className || ""}`}>
            {options.map((option) => {
                const id = `radio-card-${option.value}`;
                return (
                    <div
                        key={option.value}
                        className="w-full overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/30">
                        <Label
                            htmlFor={id}
                            className="flex cursor-pointer flex-row w-full justify-between gap-2 p-3.5">
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value={option.value} id={id} />
                                    <span className="text-sm font-medium leading-none text-foreground">
                                        {option.label}
                                    </span>

                                    {option.isCurrent && (
                                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            Atual
                                        </span>
                                    )}
                                </div>
                                {option.description && (
                                    <p className="pl-6 text-xs text-muted-foreground">
                                        {option.description}
                                    </p>
                                )}
                            </div>
                        </Label>
                    </div>
                );
            })}
        </RadioGroup>
    )
}