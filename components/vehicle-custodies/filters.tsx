"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import {
  vehicleCustodyHolderTypeOptions,
  vehicleCustodyStatusOptions,
} from "@/types/vehicle-custody.type";
import type { CityItem } from "@/types/city.type";
import type { SubunitItem } from "@/types/subunit.type";
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
  vehicleId: string;
  status: string;
  borrowerType: string;
  externalBorrowerName: string;
  cityId: string;
  subunitId: string;
  startDateFrom: string;
  startDateTo: string;
  vehicles: VehicleItem[];
  cities: CityItem[];
  subunits: SubunitItem[];
  onVehicleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onBorrowerTypeChange: (value: string) => void;
  onExternalBorrowerNameChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onSubunitChange: (value: string) => void;
  onStartDateFromChange: (value: string) => void;
  onStartDateToChange: (value: string) => void;
  onClear: () => void;
}

export function VehicleCustodiesFilters({
  vehicleId,
  status,
  borrowerType,
  externalBorrowerName,
  cityId,
  subunitId,
  startDateFrom,
  startDateTo,
  vehicles,
  cities,
  subunits,
  onVehicleChange,
  onStatusChange,
  onBorrowerTypeChange,
  onExternalBorrowerNameChange,
  onCityChange,
  onSubunitChange,
  onStartDateFromChange,
  onStartDateToChange,
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
          <Label>Veiculo</Label>
          <Select value={vehicleId} onValueChange={onVehicleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os veiculos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veiculos</SelectItem>
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
          <Label>Tipo de responsavel</Label>
          <Select value={borrowerType} onValueChange={onBorrowerTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {vehicleCustodyHolderTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="externalBorrowerName">Responsavel externo</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="externalBorrowerName"
              className="pl-9"
              placeholder="Nome do responsavel externo"
              value={externalBorrowerName}
              onChange={(event) =>
                onExternalBorrowerNameChange(event.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cidade</Label>
          <Select value={cityId} onValueChange={onCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as cidades" />
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
        </div>

        <div className="space-y-2">
          <Label>Subunidade</Label>
          <Select value={subunitId} onValueChange={onSubunitChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as subunidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as subunidades</SelectItem>
              {subunits.map((subunit) => (
                <SelectItem key={subunit.id} value={String(subunit.id)}>
                  {subunit.abbreviation
                    ? `${subunit.abbreviation} • ${subunit.name}`
                    : subunit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDateFrom">Inicio de</Label>
          <Input
            id="startDateFrom"
            type="date"
            value={startDateFrom}
            onChange={(event) => onStartDateFromChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDateTo">Inicio ate</Label>
          <Input
            id="startDateTo"
            type="date"
            value={startDateTo}
            onChange={(event) => onStartDateToChange(event.target.value)}
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
