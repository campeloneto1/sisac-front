"use client";

import { Search, X } from "lucide-react";

import type { CountryOption } from "@/types/state.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatesFiltersProps {
  search: string;
  countryId: string;
  countries: CountryOption[];
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onClear: () => void;
}

export function StatesFilters({
  search,
  countryId,
  countries,
  onSearchChange,
  onCountryChange,
  onClear,
}: StatesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_280px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou sigla"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={countryId} onValueChange={onCountryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por pais" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os paises</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country.id} value={String(country.id)}>
              {country.name} • {country.abbreviation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
