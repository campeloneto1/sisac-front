"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ArmamentSizesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

export function ArmamentSizesFilters({
  search,
  onSearchChange,
  onClear,
}: ArmamentSizesFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, slug ou descrição..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <Button type="button" variant="outline" onClick={onClear}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
