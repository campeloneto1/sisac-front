"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import type { WorkshopStatus } from "@/types/workshop.type";
import { workshopStatusOptions } from "@/types/workshop.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkshopsFiltersProps {
  search: string;
  status?: WorkshopStatus;
  city: string;
  state: string;
  specialty: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: WorkshopStatus) => void;
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
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="search"
              className="pl-9"
              placeholder="Nome, CNPJ, email ou contato"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status ?? "all"}
            onValueChange={(value) =>
              onStatusChange(value === "all" ? undefined : (value as WorkshopStatus))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {workshopStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            placeholder="Ex.: Joao Pessoa"
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">UF</Label>
          <Input
            id="state"
            maxLength={2}
            placeholder="PB"
            value={state}
            onChange={(event) => onStateChange(event.target.value.toUpperCase())}
          />
        </div>

        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="specialty">Especialidade</Label>
          <Input
            id="specialty"
            placeholder="Ex.: funilaria, eletrica, mecanica"
            value={specialty}
            onChange={(event) => onSpecialtyChange(event.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button className="w-full" type="button" variant="outline" onClick={onClear}>
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
