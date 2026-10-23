"use client";

import { useState } from "react";
import { ArrowDownUp, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SortOption<T extends string = string> {
  label: string;
  value: T;
}

interface SortSelectProps<T extends string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SortTable<T extends string>({
  options,
  value,
  onChange,
  className,
}: SortSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedOption =
    options.find((opt) => opt.value === value) ?? options[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex h-9 w-68 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 body-sm text-foreground transition-colors hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring",
          className,
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <ArrowDownUp size={16} className="shrink-0 text-muted-foreground" />
          <span className="truncate">Ordenar: {selectedOption?.label}</span>
        </div>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-68 p-1">
        <div className="px-2 py-1.5 caption-xs-medium text-muted-foreground">
          Ordenar por
        </div>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center justify-between gap-2 cursor-pointer rounded-md px-2 py-1.5 body-sm",
                isSelected && "bg-accent font-medium text-accent-foreground",
              )}
            >
              <span className="truncate">{option.label}</span>
              {isSelected && (
                <Check size={16} className="shrink-0 text-foreground" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
