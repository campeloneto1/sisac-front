"use client";

import type { VehicleItem } from "@/types/vehicle.type";
import {
  vehicleDamageDetectionMomentOptions,
  vehicleDamageSeverityOptions,
  vehicleDamageStatusOptions,
  vehicleDamageTypeOptions,
} from "@/types/vehicle-damage.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleDamagesFiltersProps {
  search: string;
  vehicleId: string;
  damageType: string;
  severity: string;
  status: string;
  detectionMoment: string;
  vehicles: VehicleItem[];
  onSearchChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onDamageTypeChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDetectionMomentChange: (value: string) => void;
  onClear: () => void;
}

export function VehicleDamagesFilters({
  search,
  vehicleId,
  damageType,
  severity,
  status,
  detectionMoment,
  vehicles,
  onSearchChange,
  onVehicleChange,
  onDamageTypeChange,
  onSeverityChange,
  onStatusChange,
  onDetectionMomentChange,
  onClear,
}: VehicleDamagesFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-5 md:grid-cols-2 xl:grid-cols-6">
      <Input
        placeholder="Buscar por descrição, local ou observações"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

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

      <Select value={damageType} onValueChange={onDamageTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {vehicleDamageTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={severity} onValueChange={onSeverityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as gravidades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as gravidades</SelectItem>
          {vehicleDamageSeverityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {vehicleDamageStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-3">
        <Select value={detectionMoment} onValueChange={onDetectionMomentChange}>
          <SelectTrigger>
            <SelectValue placeholder="Momento da deteccao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os momentos</SelectItem>
            {vehicleDamageDetectionMomentOptions.map((option) => (
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
