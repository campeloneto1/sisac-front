"use client";

import { Search, X } from "lucide-react";

import { useCities } from "@/hooks/use-cities";
import { useSubunits } from "@/hooks/use-subunits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CompaniesFiltersProps {
  search: string;
  cityId: number | undefined;
  subunitId: number | undefined;
  onSearchChange: (value: string) => void;
  onCityChange: (value: number | undefined) => void;
  onSubunitChange: (value: number | undefined) => void;
  onClear: () => void;
}

export function CompaniesFilters({
  search,
  cityId,
  subunitId,
  onSearchChange,
  onCityChange,
  onSubunitChange,
  onClear,
}: CompaniesFiltersProps) {
  const citiesQuery = useCities({});
  const subunitsQuery = useSubunits({});

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_auto_auto_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou CNPJ"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={cityId ? String(cityId) : "all"} onValueChange={(value) => onCityChange(value === "all" ? undefined : Number(value))}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Todas as cidades" />
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

      <Select value={subunitId ? String(subunitId) : "all"} onValueChange={(value) => onSubunitChange(value === "all" ? undefined : Number(value))}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Todas as subunidades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as subunidades</SelectItem>
          {(subunitsQuery.data?.data ?? []).map((subunit) => (
            <SelectItem key={subunit.id} value={String(subunit.id)}>
              {subunit.name}
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
