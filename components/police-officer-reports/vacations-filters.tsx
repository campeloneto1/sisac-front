"use client";

import { Search, X } from "lucide-react";

import { POLICE_OFFICER_VACATION_STATUS_OPTIONS } from "@/types/police-officer-vacation.type";
import { useSectors } from "@/hooks/use-sectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerVacationsFiltersProps {
  search: string;
  sectorId: string;
  vacationStatus: string;
  referenceYear: string;
  vacationScope: string;
  onSearchChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onVacationStatusChange: (value: string) => void;
  onReferenceYearChange: (value: string) => void;
  onVacationScopeChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerVacationsFilters({
  search,
  sectorId,
  vacationStatus,
  referenceYear,
  vacationScope,
  onSearchChange,
  onSectorChange,
  onVacationStatusChange,
  onReferenceYearChange,
  onVacationScopeChange,
  onClear,
}: PoliceOfficerVacationsFiltersProps) {
  const sectorsQuery = useSectors({ per_page: 100 });

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative md:col-span-2 xl:col-span-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Buscar por policial" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </div>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger><SelectValue placeholder="Setor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {(sectorsQuery.data?.data ?? []).map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>{sector.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={vacationStatus} onValueChange={onVacationStatusChange}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {POLICE_OFFICER_VACATION_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Ano de referência"
        inputMode="numeric"
        value={referenceYear}
        onChange={(event) => onReferenceYearChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
      />

      <Select value={vacationScope} onValueChange={onVacationScopeChange}>
        <SelectTrigger><SelectValue placeholder="Escopo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os escopos</SelectItem>
          <SelectItem value="active">Somente vigentes</SelectItem>
          <SelectItem value="expired">Somente expiradas</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
