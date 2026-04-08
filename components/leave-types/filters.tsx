"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BooleanFilterValue = "all" | "true" | "false";

interface LeaveTypesFiltersProps {
  search: string;
  requiresMedicalReport: BooleanFilterValue;
  affectsSalary: BooleanFilterValue;
  onSearchChange: (value: string) => void;
  onRequiresMedicalReportChange: (value: BooleanFilterValue) => void;
  onAffectsSalaryChange: (value: BooleanFilterValue) => void;
  onClear: () => void;
}

export function LeaveTypesFilters({
  search,
  requiresMedicalReport,
  affectsSalary,
  onSearchChange,
  onRequiresMedicalReportChange,
  onAffectsSalaryChange,
  onClear,
}: LeaveTypesFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="grid gap-4 p-6 md:grid-cols-[1.4fr_0.8fr_0.8fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="leave-type-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="leave-type-search"
              className="pl-9"
              placeholder="Buscar por nome, slug ou descrição"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Exige laudo</Label>
          <Select value={requiresMedicalReport} onValueChange={(value: BooleanFilterValue) => onRequiresMedicalReportChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Afeta salario</Label>
          <Select value={affectsSalary} onValueChange={(value: BooleanFilterValue) => onAffectsSalaryChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={onClear}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </CardContent>
    </Card>
  );
}
