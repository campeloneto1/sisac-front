"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ArmamentTypesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export function ArmamentTypesFilters({
  search,
  onSearchChange,
  onClear,
}: ArmamentTypesFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-5 md:grid-cols-[1fr_auto]">
      <Input
        placeholder="Buscar por nome, slug ou descricao"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Button type="button" variant="outline" onClick={onClear}>
        Limpar
      </Button>
    </div>
  );
}
