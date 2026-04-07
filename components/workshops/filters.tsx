"use client";

import { Search, X } from "lucide-react";

import { workshopStatusOptions } from "@/types/workshop.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkshopsFiltersProps {
  search: string;
  status: string;
  city: string;
  state: string;
  specialty: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onClear: () => void;
}

export function WorkshopsFilters({
  search,
  status,
  city,
  state,
  specialty,
  onSearchChange,
  onStatusChange,
  onCityChange,
  onStateChange,
  onSpecialtyChange,
  onClear,
}: WorkshopsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))_auto]">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, CNPJ, email ou cidade"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {workshopStatusOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Cidade"
        value={city}
        onChange={(event) => onCityChange(event.target.value)}
      />

      <Input
        maxLength={2}
        placeholder="UF"
        value={state}
        onChange={(event) => onStateChange(event.target.value.toUpperCase())}
      />

      <Input
        placeholder="Especialidade"
        value={specialty}
        onChange={(event) => onSpecialtyChange(event.target.value)}
      />

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
