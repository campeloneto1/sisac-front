"use client";

import { Search, X } from "lucide-react";

import type {
  PoliceOfficerEducationLevelOption,
  PoliceOfficerGenderOption,
  PoliceOfficerSectorOption,
  PoliceOfficerRankOption,
  PoliceOfficerAssignmentOption,
} from "@/types/police-officer.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficersFiltersProps {
  search: string;
  sectorId: string;
  rankId: string;
  assignmentId: string;
  genderId: string;
  educationLevelId: string;
  isActive: string;
  sectors: PoliceOfficerSectorOption[];
  ranks: PoliceOfficerRankOption[];
  assignments: PoliceOfficerAssignmentOption[];
  genders: PoliceOfficerGenderOption[];
  educationLevels: PoliceOfficerEducationLevelOption[];
  onSearchChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onRankChange: (value: string) => void;
  onAssignmentChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onEducationLevelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficersFilters({
  search,
  sectorId,
  rankId,
  assignmentId,
  genderId,
  educationLevelId,
  isActive,
  sectors,
  ranks,
  assignments,
  genders,
  educationLevels,
  onSearchChange,
  onSectorChange,
  onRankChange,
  onAssignmentChange,
  onGenderChange,
  onEducationLevelChange,
  onStatusChange,
  onClear,
}: PoliceOfficersFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-[1.2fr_repeat(5,minmax(0,1fr))_auto]">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, nome de guerra, matrícula, CPF ou email"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {sector.name}
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
          {ranks.map((rank) => (
            <SelectItem key={rank.id} value={String(rank.id)}>
              {rank.name}
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
          {assignments.map((assignment) => (
            <SelectItem key={assignment.id} value={String(assignment.id)}>
              {assignment.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={genderId} onValueChange={onGenderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Gênero" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os gêneros</SelectItem>
          {genders.map((gender) => (
            <SelectItem key={gender.id} value={String(gender.id)}>
              {gender.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={educationLevelId} onValueChange={onEducationLevelChange}>
        <SelectTrigger>
          <SelectValue placeholder="Escolaridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {educationLevels.map((educationLevel) => (
            <SelectItem key={educationLevel.id} value={String(educationLevel.id)}>
              {educationLevel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isActive} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Inativos</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
