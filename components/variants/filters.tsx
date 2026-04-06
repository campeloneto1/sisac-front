"use client";

import { Search, X } from "lucide-react";

import type { BrandOption } from "@/types/variant.type";
import { getBrandTypeLabel } from "@/types/brand.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VariantsFiltersProps {
  search: string;
  brandId: string;
  brands: BrandOption[];
  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onClear: () => void;
}

export function VariantsFilters({
  search,
  brandId,
  brands,
  onSearchChange,
  onBrandChange,
  onClear,
}: VariantsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_280px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou sigla"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={brandId} onValueChange={onBrandChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por marca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as marcas</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={String(brand.id)}>
              {brand.name} • {getBrandTypeLabel(brand.type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
