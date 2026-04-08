"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceTypesFiltersProps {
  search: string;
  active: string;
  requiresApproval: string;
  onSearchChange: (value: string) => void;
  onActiveChange: (value: string) => void;
  onRequiresApprovalChange: (value: string) => void;
  onClear: () => void;
}

export function ServiceTypesFilters({
  search,
  active,
  requiresApproval,
  onSearchChange,
  onActiveChange,
  onRequiresApprovalChange,
  onClear,
}: ServiceTypesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_180px_220px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome ou codigo"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={active} onValueChange={onActiveChange}>
        <SelectTrigger>
          <SelectValue placeholder="Ativo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Ativos</SelectItem>
          <SelectItem value="false">Inativos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={requiresApproval} onValueChange={onRequiresApprovalChange}>
        <SelectTrigger>
          <SelectValue placeholder="Aprovacao" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Qualquer aprovacao</SelectItem>
          <SelectItem value="true">Requer aprovacao</SelectItem>
          <SelectItem value="false">Nao requer aprovacao</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
