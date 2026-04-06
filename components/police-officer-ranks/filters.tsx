"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface PoliceOfficerRanksFiltersProps {
  policeOfficerId?: number;
  rankId?: number;
  currentOnly: boolean;
  onPoliceOfficerIdChange: (value?: number) => void;
  onRankIdChange: (value?: number) => void;
  onCurrentOnlyChange: (value: boolean) => void;
  onClear: () => void;
  policeOfficers?: Array<{ id: number; name?: string | null; registration_number?: string | null }>;
  ranks?: Array<{ id: number; name: string; abbreviation?: string | null }>;
}

export function PoliceOfficerRanksFilters({
  policeOfficerId,
  rankId,
  currentOnly,
  onPoliceOfficerIdChange,
  onRankIdChange,
  onCurrentOnlyChange,
  onClear,
  policeOfficers = [],
  ranks = [],
}: PoliceOfficerRanksFiltersProps) {
  const policeOfficerValue = policeOfficerId ? policeOfficerId.toString() : "all";
  const rankValue = rankId ? rankId.toString() : "all";

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1fr_1fr_auto_auto]">
      <div className="space-y-2">
        <Label htmlFor="filter-police-officer">Policial</Label>
        <Select
          value={policeOfficerValue}
          onValueChange={(value) => onPoliceOfficerIdChange(value === "all" ? undefined : Number(value))}
        >
          <SelectTrigger id="filter-police-officer">
            <SelectValue placeholder="Todos os policiais" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {policeOfficers.map((officer) => (
              <SelectItem key={officer.id} value={officer.id.toString()}>
                {officer.name} {officer.registration_number ? `(${officer.registration_number})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-rank">Graduação</Label>
        <Select
          value={rankValue}
          onValueChange={(value) => onRankIdChange(value === "all" ? undefined : Number(value))}
        >
          <SelectTrigger id="filter-rank">
            <SelectValue placeholder="Todas as graduações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ranks.map((rank) => (
              <SelectItem key={rank.id} value={rank.id.toString()}>
                {rank.name} {rank.abbreviation ? `(${rank.abbreviation})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="current-only"
            checked={currentOnly}
            onCheckedChange={(checked) => onCurrentOnlyChange(!!checked)}
          />
          <Label htmlFor="current-only" className="text-sm font-normal cursor-pointer">
            Somente atuais
          </Label>
        </div>
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
