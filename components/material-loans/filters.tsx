"use client";

import { X } from "lucide-react";

import {
  materialLoanKindOptions,
  materialLoanStatusOptions,
} from "@/types/material-loan.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialLoansFiltersProps {
  kind: string;
  status: string;
  onKindChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function MaterialLoansFilters({
  kind,
  status,
  onKindChange,
  onStatusChange,
  onClear,
}: MaterialLoansFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={kind} onValueChange={onKindChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {materialLoanKindOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {materialLoanStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
