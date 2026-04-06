"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BooleanFilterValue = "all" | "true" | "false";

interface PublicationTypesFiltersProps {
  search: string;
  isPositive: BooleanFilterValue;
  generatesPoints: BooleanFilterValue;
  onSearchChange: (value: string) => void;
  onIsPositiveChange: (value: BooleanFilterValue) => void;
  onGeneratesPointsChange: (value: BooleanFilterValue) => void;
  onClear: () => void;
}

export function PublicationTypesFilters({
  search,
  isPositive,
  generatesPoints,
  onSearchChange,
  onIsPositiveChange,
  onGeneratesPointsChange,
  onClear,
}: PublicationTypesFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 xl:col-span-2">
          <Label htmlFor="publication-type-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="publication-type-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
              placeholder="Buscar por nome, slug ou descricao"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Natureza</Label>
          <Select value={isPositive} onValueChange={(value) => onIsPositiveChange(value as BooleanFilterValue)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Positivos</SelectItem>
              <SelectItem value="false">Negativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Gera pontos</Label>
          <Select value={generatesPoints} onValueChange={(value) => onGeneratesPointsChange(value as BooleanFilterValue)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Nao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 xl:col-span-4">
          <Button type="button" variant="outline" onClick={onClear}>
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
