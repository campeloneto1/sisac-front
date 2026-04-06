"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CountriesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export function CountriesFilters({ search, onSearchChange, onClear }: CountriesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou sigla"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
