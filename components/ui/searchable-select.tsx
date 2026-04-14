"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SearchableSelectOption {
  value: string;
  label: string;
  keywords?: string[];
}

interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione uma opcao",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhuma opcao encontrada.",
  triggerClassName,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [open]);

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => {
      const haystacks = [option.label, option.value, ...(option.keywords ?? [])]
        .join(" ")
        .toLocaleLowerCase();

      return haystacks.includes(normalizedSearch);
    });
  }, [options, search]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation();
  }

  return (
    <Select
      disabled={disabled}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setSearch("");
        }
      }}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="border-b border-slate-200 p-2">
          <Input
            ref={inputRef}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="h-9"
          />
        </div>

        {filteredOptions.length ? (
          filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        ) : (
          <div className="px-3 py-4 text-sm text-slate-500">{emptyMessage}</div>
        )}
      </SelectContent>
    </Select>
  );
}
