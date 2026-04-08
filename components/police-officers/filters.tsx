"use client";

import { Search, X } from "lucide-react";

import type {
  PoliceOfficerBankOption,
  PoliceOfficerCityOption,
  PoliceOfficerEducationLevelOption,
  PoliceOfficerGenderOption,
} from "@/types/police-officer.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficersFiltersProps {
  search: string;
  cityId: string;
  bankId: string;
  genderId: string;
  educationLevelId: string;
  isActive: string;
  cities: PoliceOfficerCityOption[];
  banks: PoliceOfficerBankOption[];
  genders: PoliceOfficerGenderOption[];
  educationLevels: PoliceOfficerEducationLevelOption[];
  onSearchChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onBankChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onEducationLevelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficersFilters({
  search,
  cityId,
  bankId,
  genderId,
  educationLevelId,
  isActive,
  cities,
  banks,
  genders,
  educationLevels,
  onSearchChange,
  onCityChange,
  onBankChange,
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

      <Select value={cityId} onValueChange={onCityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as cidades</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city.id} value={String(city.id)}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={bankId} onValueChange={onBankChange}>
        <SelectTrigger>
          <SelectValue placeholder="Banco" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os bancos</SelectItem>
          {banks.map((bank) => (
            <SelectItem key={bank.id} value={String(bank.id)}>
              {bank.name}
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
