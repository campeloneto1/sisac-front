"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import {
  vehicleCustodyCustodianTypeOptions,
  vehicleCustodyStatusOptions,
} from "@/types/vehicle-custody.type";
import type { VehicleItem } from "@/types/vehicle.type";
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

interface VehicleCustodiesFiltersProps {
  search: string;
  vehicleId: string;
  status: string;
  custodianType: string;
  startDate: string;
  endDate: string;
  vehicles: VehicleItem[];
  onSearchChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCustodianTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
}

export function VehicleCustodiesFilters({
  search,
  vehicleId,
  status,
  custodianType,
  startDate,
  endDate,
  vehicles,
  onSearchChange,
  onVehicleChange,
  onStatusChange,
  onCustodianTypeChange,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: VehicleCustodiesFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="search"
              className="pl-9"
              placeholder="Documento ou placa"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Veículo</Label>
          <Select value={vehicleId} onValueChange={onVehicleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os veículos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veículos</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                  {vehicle.license_plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {vehicleCustodyStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de custodiante</Label>
          <Select value={custodianType} onValueChange={onCustodianTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {vehicleCustodyCustodianTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Início a partir de</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fim ate</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button
            className="w-full"
            type="button"
            variant="outline"
            onClick={onClear}
          >
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
