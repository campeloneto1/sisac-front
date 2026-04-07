"use client";

import { Search, X } from "lucide-react";

import type {
  ArmamentLoanKind,
  ArmamentLoanStatus,
} from "@/types/armament-loan.type";
import { armamentLoanKindOptions, armamentLoanStatusOptions } from "@/types/armament-loan.type";
import type { ArmamentItem } from "@/types/armament.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
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

interface ArmamentLoansFiltersProps {
  search: string;
  policeOfficerId: string;
  kind: string;
  status: string;
  armamentId: string;
  loanedFrom: string;
  loanedTo: string;
  policeOfficers: Pick<
    PoliceOfficerItem,
    "id" | "war_name" | "registration_number" | "name"
  >[];
  armaments: ArmamentItem[];
  onSearchChange: (value: string) => void;
  onPoliceOfficerChange: (value: string) => void;
  onKindChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onArmamentChange: (value: string) => void;
  onLoanedFromChange: (value: string) => void;
  onLoanedToChange: (value: string) => void;
  onClear: () => void;
}

function getArmamentLabel(armament: ArmamentItem) {
  return [armament.type?.name, armament.variant?.name].filter(Boolean).join(" ");
}

export function ArmamentLoansFilters({
  search,
  policeOfficerId,
  kind,
  status,
  armamentId,
  loanedFrom,
  loanedTo,
  policeOfficers,
  armaments,
  onSearchChange,
  onPoliceOfficerChange,
  onKindChange,
  onStatusChange,
  onArmamentChange,
  onLoanedFromChange,
  onLoanedToChange,
  onClear,
}: ArmamentLoansFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="space-y-4 pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Buscar por policial, aprovador ou armamento..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Select value={policeOfficerId} onValueChange={onPoliceOfficerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Policial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os policiais</SelectItem>
              {policeOfficers.map((officer) => (
                <SelectItem key={officer.id} value={String(officer.id)}>
                  {officer.war_name || officer.name || officer.registration_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={kind} onValueChange={onKindChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {armamentLoanKindOptions.map((option) => (
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
              {armamentLoanStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={armamentId} onValueChange={onArmamentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Armamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os armamentos</SelectItem>
              {armaments.map((armament) => (
                <SelectItem key={armament.id} value={String(armament.id)}>
                  {getArmamentLabel(armament) || `Armamento #${armament.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={loanedFrom}
            onChange={(event) => onLoanedFromChange(event.target.value)}
          />

          <Input
            type="date"
            value={loanedTo}
            onChange={(event) => onLoanedToChange(event.target.value)}
          />
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
