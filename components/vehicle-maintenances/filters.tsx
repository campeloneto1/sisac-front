"use client";

import type { VehicleItem } from "@/types/vehicle.type";
import {
  vehicleMaintenanceStatusOptions,
  vehicleMaintenanceTypeOptions,
} from "@/types/vehicle-maintenance.type";
import type { WorkshopItem } from "@/types/workshop.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleMaintenancesFiltersProps {
  search: string;
  vehicleId: string;
  workshopId: string;
  maintenanceType: string;
  status: string;
  vehicles: VehicleItem[];
  workshops: WorkshopItem[];
  onSearchChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onWorkshopChange: (value: string) => void;
  onMaintenanceTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function VehicleMaintenancesFilters({
  search,
  vehicleId,
  workshopId,
  maintenanceType,
  status,
  vehicles,
  workshops,
  onSearchChange,
  onVehicleChange,
  onWorkshopChange,
  onMaintenanceTypeChange,
  onStatusChange,
  onClear,
}: VehicleMaintenancesFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-5 md:grid-cols-2 xl:grid-cols-5">
      <Input
        placeholder="Buscar por placa, descricao ou observacoes"
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

      <Select value={workshopId} onValueChange={onWorkshopChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as oficinas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as oficinas</SelectItem>
          {workshops.map((workshop) => (
            <SelectItem key={workshop.id} value={String(workshop.id)}>
              {workshop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={maintenanceType} onValueChange={onMaintenanceTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {vehicleMaintenanceTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-3">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {vehicleMaintenanceStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={onClear}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
