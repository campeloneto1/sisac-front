"use client";

import { Search, X } from "lucide-react";

import type { MaterialTypeItem } from "@/types/material-type.type";
import type { VariantItem } from "@/types/variant.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MaterialsFiltersProps {
  search: string;
  materialTypeId: string;
  variantId: string;
  materialTypes: MaterialTypeItem[];
  variants: VariantItem[];
  onSearchChange: (value: string) => void;
  onMaterialTypeChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  onClear: () => void;
}

export function MaterialsFilters({
  search,
  materialTypeId,
  variantId,
  materialTypes,
  variants,
  onSearchChange,
  onMaterialTypeChange,
  onVariantChange,
  onClear,
}: MaterialsFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_auto]">
      <div className="space-y-2">
        <Label htmlFor="materials-search">Busca</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="materials-search"
            className="pl-9"
            placeholder="Buscar por tipo ou variante"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipo de material</Label>
        <Select value={materialTypeId} onValueChange={onMaterialTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {materialTypes.map((materialType) => (
              <SelectItem key={materialType.id} value={String(materialType.id)}>
                {materialType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Variante</Label>
        <Select value={variantId} onValueChange={onVariantChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as variantes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as variantes</SelectItem>
            {variants.map((variant) => (
              <SelectItem key={variant.id} value={String(variant.id)}>
                {variant.brand?.name ? `${variant.brand.name} - ${variant.name}` : variant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button type="button" variant="outline" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
}
