"use client";

import { Search, X } from "lucide-react";

import { useAssignments } from "@/hooks/use-assignments";
import { useRanks } from "@/hooks/use-ranks";
import { useSectors } from "@/hooks/use-sectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerAggregateFiltersProps {
  search: string;
  sectorId: string;
  assignmentId: string;
  rankId: string;
  activeStatus: string;
  onSearchChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onAssignmentChange: (value: string) => void;
  onRankChange: (value: string) => void;
  onActiveStatusChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerAggregateFilters({
  search,
  sectorId,
  assignmentId,
  rankId,
  activeStatus,
  onSearchChange,
  onSectorChange,
  onAssignmentChange,
  onRankChange,
  onActiveStatusChange,
  onClear,
}: PoliceOfficerAggregateFiltersProps) {
  const sectorsQuery = useSectors({ per_page: 100 });
  const assignmentsQuery = useAssignments({ per_page: 100 });
  const ranksQuery = useRanks({ per_page: 100 });

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative md:col-span-2 xl:col-span-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, nome de guerra, matrícula, numeral, CPF ou email"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={activeStatus} onValueChange={onActiveStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {(sectorsQuery.data?.data ?? []).map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {sector.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={assignmentId} onValueChange={onAssignmentChange}>
        <SelectTrigger>
          <SelectValue placeholder="Função" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as funções</SelectItem>
          {(assignmentsQuery.data?.data ?? []).map((assignment) => (
            <SelectItem key={assignment.id} value={String(assignment.id)}>
              {assignment.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rankId} onValueChange={onRankChange}>
        <SelectTrigger>
          <SelectValue placeholder="Graduação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as graduações</SelectItem>
          {(ranksQuery.data?.data ?? []).map((rank) => (
            <SelectItem key={rank.id} value={String(rank.id)}>
              {rank.name}
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
