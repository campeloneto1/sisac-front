"use client";

import { Search, X } from "lucide-react";

import type { ArmamentCaliberItem } from "@/types/armament-caliber.type";
import type { ArmamentSizeItem } from "@/types/armament-size.type";
import type { ArmamentTypeItem } from "@/types/armament-type.type";
import type { GenderItem } from "@/types/gender.type";
import type { SubunitItem } from "@/types/subunit.type";
import type { VariantItem } from "@/types/variant.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ArmamentsFiltersProps {
  search: string;
  subunitId: string;
  typeId: string;
  variantId: string;
  caliberId: string;
  sizeId: string;
  genderId: string;
  subunits: Pick<SubunitItem, "id" | "name" | "abbreviation">[];
  types: Pick<ArmamentTypeItem, "id" | "name">[];
  variants: Pick<VariantItem, "id" | "name" | "brand">[];
  calibers: Pick<ArmamentCaliberItem, "id" | "name">[];
  sizes: Pick<ArmamentSizeItem, "id" | "name">[];
  genders: Pick<GenderItem, "id" | "name">[];
  onSearchChange: (value: string) => void;
  onSubunitChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onVariantChange: (value: string) => void;
  onCaliberChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onClear: () => void;
}

export function ArmamentsFilters({
  search,
  subunitId,
  typeId,
  variantId,
  caliberId,
  sizeId,
  genderId,
  subunits,
  types,
  variants,
  calibers,
  sizes,
  genders,
  onSearchChange,
  onSubunitChange,
  onTypeChange,
  onVariantChange,
  onCaliberChange,
  onSizeChange,
  onGenderChange,
  onClear,
}: ArmamentsFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="space-y-4 pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por tipo ou variante..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Select value={subunitId} onValueChange={onSubunitChange}>
            <SelectTrigger>
              <SelectValue placeholder="Subunidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as subunidades</SelectItem>
              {subunits.map((subunit) => (
                <SelectItem key={subunit.id} value={String(subunit.id)}>
                  {subunit.abbreviation || subunit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeId} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {types.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={variantId} onValueChange={onVariantChange}>
            <SelectTrigger>
              <SelectValue placeholder="Variante" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as variantes</SelectItem>
              {variants.map((variant) => (
                <SelectItem key={variant.id} value={String(variant.id)}>
                  {variant.brand?.name
                    ? `${variant.brand.name} - ${variant.name}`
                    : variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={caliberId} onValueChange={onCaliberChange}>
            <SelectTrigger>
              <SelectValue placeholder="Calibre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os calibres</SelectItem>
              {calibers.map((caliber) => (
                <SelectItem key={caliber.id} value={String(caliber.id)}>
                  {caliber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sizeId} onValueChange={onSizeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tamanhos</SelectItem>
              {sizes.map((size) => (
                <SelectItem key={size.id} value={String(size.id)}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genderId} onValueChange={onGenderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Gênero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os gêneros</SelectItem>
              {genders.map((gender) => (
                <SelectItem key={gender.id} value={String(gender.id)}>
                  {gender.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClear}>
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
