"use client";

import { Search, X } from "lucide-react";

import { useAssignments } from "@/hooks/use-assignments";
import { useCities } from "@/hooks/use-cities";
import { useEducationLevels } from "@/hooks/use-education-levels";
import { useGenders } from "@/hooks/use-genders";
import { useRanks } from "@/hooks/use-ranks";
import { useSectors } from "@/hooks/use-sectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerActiveInactiveFiltersProps {
  search: string;
  cityId: string;
  genderId: string;
  educationLevelId: string;
  sectorId: string;
  assignmentId: string;
  rankId: string;
  activeStatus: string;
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onEducationLevelChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onAssignmentChange: (value: string) => void;
  onRankChange: (value: string) => void;
  onActiveStatusChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerActiveInactiveFilters({
  search,
  cityId,
  genderId,
  educationLevelId,
  sectorId,
  assignmentId,
  rankId,
  activeStatus,
  onSearchChange,
  onCityChange,
  onGenderChange,
  onEducationLevelChange,
  onSectorChange,
  onAssignmentChange,
  onRankChange,
  onActiveStatusChange,
  onClear,
}: PoliceOfficerActiveInactiveFiltersProps) {
  const citiesQuery = useCities({ per_page: 100 });
  const gendersQuery = useGenders({ per_page: 100 });
  const educationLevelsQuery = useEducationLevels({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 });
  const assignmentsQuery = useAssignments({ per_page: 100 });
  const ranksQuery = useRanks({ per_page: 100 });

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-4">
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

      <Select value={cityId} onValueChange={onCityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as cidades</SelectItem>
          {(citiesQuery.data?.data ?? []).map((city) => (
            <SelectItem key={city.id} value={String(city.id)}>
              {city.name}
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
          {(gendersQuery.data?.data ?? []).map((gender) => (
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
          <SelectItem value="all">Todas as escolaridades</SelectItem>
          {(educationLevelsQuery.data?.data ?? []).map((educationLevel) => (
            <SelectItem key={educationLevel.id} value={String(educationLevel.id)}>
              {educationLevel.name}
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
