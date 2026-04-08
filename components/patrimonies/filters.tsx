"use client";

import { Search, X } from "lucide-react";

import type { PatrimonyTypeItem } from "@/types/patrimony-type.type";
import type { SectorItem } from "@/types/sector.type";
import {
  type PatrimonyStatusValue,
} from "@/types/patrimony.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatrimoniesFiltersProps {
  search: string;
  patrimonyTypeId: string;
  sectorId: string;
  status: string;
  patrimonyTypes: Pick<PatrimonyTypeItem, "id" | "name">[];
  sectors: Pick<SectorItem, "id" | "name" | "abbreviation">[];
  onSearchChange: (value: string) => void;
  onPatrimonyTypeChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

const statusOptions: Array<{ value: PatrimonyStatusValue; label: string }> = [
  { value: "active", label: "Ativo" },
  { value: "returned", label: "Devolvido ao Estado" },
  { value: "disposed", label: "Inutilizado" },
];

export function PatrimoniesFilters({
  search,
  patrimonyTypeId,
  sectorId,
  status,
  patrimonyTypes,
  sectors,
  onSearchChange,
  onPatrimonyTypeChange,
  onSectorChange,
  onStatusChange,
  onClear,
}: PatrimoniesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 xl:grid-cols-4">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por codigo, serie ou descrição"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={patrimonyTypeId} onValueChange={onPatrimonyTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de patrimônio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {patrimonyTypes.map((type) => (
            <SelectItem key={type.id} value={String(type.id)}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Setor atual" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {sector.abbreviation ? `${sector.abbreviation} • ${sector.name}` : sector.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="xl:col-span-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
