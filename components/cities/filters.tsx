"use client";

import { Search, X } from "lucide-react";

import type { CityStateOption } from "@/types/city.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CitiesFiltersProps {
  search: string;
  stateId: string;
  states: CityStateOption[];
  onSearchChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onClear: () => void;
}

export function CitiesFilters({ search, stateId, states, onSearchChange, onStateChange, onClear }: CitiesFiltersProps) {
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

      <Select value={stateId} onValueChange={onStateChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os estados</SelectItem>
          {states.map((state) => (
            <SelectItem key={state.id} value={String(state.id)}>
              {state.name} • {state.abbreviation}
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
