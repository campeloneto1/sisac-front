"use client";

import { Search, X } from "lucide-react";

import type { SubunitItem } from "@/types/subunit.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubunitsFiltersProps {
  search: string;
  cityId: string;
  unitId: string;
  cities: Array<NonNullable<SubunitItem["city"]>>;
  units: Array<NonNullable<SubunitItem["unit"]>>;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onClear: () => void;
}

export function SubunitsFilters({
  search,
  cityId,
  unitId,
  cities,
  units,
  onSearchChange,
  onCityChange,
  onUnitChange,
  onClear,
}: SubunitsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_220px_220px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, sigla ou email"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={cityId} onValueChange={onCityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as cidades</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city.id} value={String(city.id)}>
              {city.name} • {city.abbreviation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={unitId} onValueChange={onUnitChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por unidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as unidades</SelectItem>
          {units.map((unit) => (
            <SelectItem key={unit.id} value={String(unit.id)}>
              {unit.name} • {unit.abbreviation}
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
