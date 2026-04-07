"use client";

import type { VehicleItem } from "@/types/vehicle.type";
import { vehicleFuelTypeOptions } from "@/types/vehicle-fueling.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleFuelingsFiltersProps {
  search: string;
  vehicleId: string;
  fuelType: string;
  isFullTank: string;
  fuelingDateFrom: string;
  fuelingDateTo: string;
  vehicles: VehicleItem[];
  onSearchChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onFuelTypeChange: (value: string) => void;
  onIsFullTankChange: (value: string) => void;
  onFuelingDateFromChange: (value: string) => void;
  onFuelingDateToChange: (value: string) => void;
  onClear: () => void;
}

export function VehicleFuelingsFilters({
  search,
  vehicleId,
  fuelType,
  isFullTank,
  fuelingDateFrom,
  fuelingDateTo,
  vehicles,
  onSearchChange,
  onVehicleChange,
  onFuelTypeChange,
  onIsFullTankChange,
  onFuelingDateFromChange,
  onFuelingDateToChange,
  onClear,
}: VehicleFuelingsFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-5 md:grid-cols-2 xl:grid-cols-6">
      <Input
        placeholder="Buscar por posto, cupom ou observacoes"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

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

      <Select value={fuelType} onValueChange={onFuelTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os combustiveis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os combustiveis</SelectItem>
          {vehicleFuelTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isFullTank} onValueChange={onIsFullTankChange}>
        <SelectTrigger>
          <SelectValue placeholder="Tanque cheio?" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tanque cheio ou parcial</SelectItem>
          <SelectItem value="true">Tanque cheio</SelectItem>
          <SelectItem value="false">Parcial</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={fuelingDateFrom}
        onChange={(event) => onFuelingDateFromChange(event.target.value)}
      />

      <div className="flex gap-3">
        <Input
          type="date"
          value={fuelingDateTo}
          onChange={(event) => onFuelingDateToChange(event.target.value)}
        />
        <Button type="button" variant="outline" onClick={onClear}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
