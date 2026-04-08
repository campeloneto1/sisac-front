"use client";

import type { CompanyItem } from "@/types/company.type";
import {
  vehicleRentalStatusOptions,
  type VehicleRentalStatus,
} from "@/types/vehicle-rental.type";
import type { VehicleItem } from "@/types/vehicle.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleRentalsFiltersProps {
  search: string;
  status: string;
  vehicleId: string;
  companyId: string;
  vehicles: VehicleItem[];
  companies: CompanyItem[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVehicleChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onClear: () => void;
}

export function VehicleRentalsFilters({
  search,
  status,
  vehicleId,
  companyId,
  vehicles,
  companies,
  onSearchChange,
  onStatusChange,
  onVehicleChange,
  onCompanyChange,
  onClear,
}: VehicleRentalsFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-5 md:grid-cols-2 xl:grid-cols-4">
      <Input
        placeholder="Buscar por contrato, placa ou locadora"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {vehicleRentalStatusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value satisfies VehicleRentalStatus}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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

      <div className="flex gap-3">
        <Select value={companyId} onValueChange={onCompanyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as locadoras" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as locadoras</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={String(company.id)}>
                {company.trade_name || company.name}
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
