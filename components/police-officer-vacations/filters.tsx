"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import type { PoliceOfficerItem } from "@/types/police-officer.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerVacationsFiltersProps {
  search: string;
  status: string;
  policeOfficerId: string;
  referenceYear: string;
  policeOfficers: PoliceOfficerItem[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPoliceOfficerChange: (value: string) => void;
  onReferenceYearChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerVacationsFilters({
  search,
  status,
  policeOfficerId,
  referenceYear,
  policeOfficers,
  onSearchChange,
  onStatusChange,
  onPoliceOfficerChange,
  onReferenceYearChange,
  onClear,
}: PoliceOfficerVacationsFiltersProps) {
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
          <Label htmlFor="vacation-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="vacation-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
              placeholder="Buscar por nome, guerra ou matricula"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="partial">Parcial</SelectItem>
              <SelectItem value="completed">Concluido</SelectItem>
              <SelectItem value="sold">Dias vendidos</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vacation-reference-year">Ano de referencia</Label>
          <Input
            id="vacation-reference-year"
            value={referenceYear}
            onChange={(event) => onReferenceYearChange(event.target.value)}
            placeholder="Ex.: 2025"
            inputMode="numeric"
          />
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-3">
          <Label>Policial</Label>
          <Select value={policeOfficerId} onValueChange={onPoliceOfficerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {policeOfficers.map((officer) => (
                <SelectItem key={officer.id} value={String(officer.id)}>
                  {(officer.name ?? officer.user?.name ?? officer.war_name) || `Policial #${officer.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button type="button" variant="outline" className="w-full" onClick={onClear}>
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
