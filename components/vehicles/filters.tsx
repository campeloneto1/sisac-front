"use client";

import { Search, X } from "lucide-react";

import type { ColorItem } from "@/types/color.type";
import type { UserListItem } from "@/types/user.type";
import type { VariantItem } from "@/types/variant.type";
import type { VehicleTypeItem } from "@/types/vehicle-type.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehiclesFiltersProps {
  search: string;
  colorId: string;
  vehicleTypeId: string;
  variantId: string;
  assignedToUserId: string;
  availability: string;
  activity: string;
  colors: ColorItem[];
  vehicleTypes: VehicleTypeItem[];
  variants: VariantItem[];
  users: UserListItem[];
  onSearchChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onVehicleTypeChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  onAssignedToUserChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
  onActivityChange: (value: string) => void;
  onClear: () => void;
}

export function VehiclesFilters({
  search,
  colorId,
  vehicleTypeId,
  variantId,
  assignedToUserId,
  availability,
  activity,
  colors,
  vehicleTypes,
  variants,
  users,
  onSearchChange,
  onColorChange,
  onVehicleTypeChange,
  onVariantChange,
  onAssignedToUserChange,
  onAvailabilityChange,
  onActivityChange,
  onClear,
}: VehiclesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(6,minmax(0,1fr))_auto]">
      <div className="relative md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por placa, chassi, RENAVAM, placa especial..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={vehicleTypeId} onValueChange={onVehicleTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {vehicleTypes.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={variantId} onValueChange={onVariantChange}>
        <SelectTrigger>
          <SelectValue placeholder="Modelo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os modelos</SelectItem>
          {variants.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={colorId} onValueChange={onColorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Cor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as cores</SelectItem>
          {colors.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={assignedToUserId} onValueChange={onAssignedToUserChange}>
        <SelectTrigger>
          <SelectValue placeholder="Responsavel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {users.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={availability} onValueChange={onAvailabilityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Disponibilidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="available">Disponiveis</SelectItem>
          <SelectItem value="unavailable">Indisponiveis</SelectItem>
        </SelectContent>
      </Select>

      <Select value={activity} onValueChange={onActivityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Atividade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="inactive">Baixados</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
