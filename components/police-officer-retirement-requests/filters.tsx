"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import type { PoliceOfficerItem } from "@/types/police-officer.type";
import {
  RETIREMENT_REQUEST_STATUS_OPTIONS,
  type PoliceOfficerRetirementRequestStatus,
} from "@/types/police-officer-retirement-request.type";
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

interface PoliceOfficerRetirementRequestsFiltersProps {
  search: string;
  policeOfficerId: string;
  status: string;
  requestedAtFrom: string;
  requestedAtTo: string;
  policeOfficers: PoliceOfficerItem[];
  onSearchChange: (value: string) => void;
  onPoliceOfficerChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRequestedAtFromChange: (value: string) => void;
  onRequestedAtToChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerRetirementRequestsFilters({
  search,
  policeOfficerId,
  status,
  requestedAtFrom,
  requestedAtTo,
  policeOfficers,
  onSearchChange,
  onPoliceOfficerChange,
  onStatusChange,
  onRequestedAtFromChange,
  onRequestedAtToChange,
  onClear,
}: PoliceOfficerRetirementRequestsFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr_auto] xl:items-end">
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="police-officer-retirement-request-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="police-officer-retirement-request-search"
              className="pl-9"
              placeholder="NUP, boletim, policial..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Policial</Label>
          <Select value={policeOfficerId} onValueChange={onPoliceOfficerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {policeOfficers.map((officer) => (
                <SelectItem key={officer.id} value={String(officer.id)}>
                  {officer.name ??
                    officer.user?.name ??
                    officer.war_name ??
                    `Policial #${officer.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {RETIREMENT_REQUEST_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requested_at_from">Data a partir de</Label>
          <Input
            id="requested_at_from"
            type="date"
            value={requestedAtFrom}
            onChange={(event) => onRequestedAtFromChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requested_at_to">Data ate</Label>
          <Input
            id="requested_at_to"
            type="date"
            value={requestedAtTo}
            onChange={(event) => onRequestedAtToChange(event.target.value)}
          />
        </div>

        <Button variant="outline" onClick={onClear}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </CardContent>
    </Card>
  );
}
