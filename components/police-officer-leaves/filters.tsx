"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import type { LeaveTypeItem } from "@/types/leave-type.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
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

interface PoliceOfficerLeavesFiltersProps {
  search: string;
  status: string;
  policeOfficerId: string;
  leaveTypeId: string;
  startDateFrom: string;
  startDateTo: string;
  policeOfficers: PoliceOfficerItem[];
  leaveTypes: LeaveTypeItem[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPoliceOfficerChange: (value: string) => void;
  onLeaveTypeChange: (value: string) => void;
  onStartDateFromChange: (value: string) => void;
  onStartDateToChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerLeavesFilters({
  search,
  status,
  policeOfficerId,
  leaveTypeId,
  startDateFrom,
  startDateTo,
  policeOfficers,
  leaveTypes,
  onSearchChange,
  onStatusChange,
  onPoliceOfficerChange,
  onLeaveTypeChange,
  onStartDateFromChange,
  onStartDateToChange,
  onClear,
}: PoliceOfficerLeavesFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-[1.4fr_0.9fr_1fr_1fr_0.9fr_0.9fr_auto] xl:items-end">
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="police-officer-leave-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="police-officer-leave-search"
              className="pl-9"
              placeholder="Policial, CRM, CID, hospital, observações..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="requested">Solicitado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="ongoing">Em andamento</SelectItem>
              <SelectItem value="awaiting_copem">Aguardando COPEM</SelectItem>
              <SelectItem value="copem_scheduled">COPEM agendada</SelectItem>
              <SelectItem value="in_copem_evaluation">Em avaliação COPEM</SelectItem>
              <SelectItem value="copem_approved">Aprovado pela COPEM</SelectItem>
              <SelectItem value="copem_rejected">Reprovado pela COPEM</SelectItem>
              <SelectItem value="completed">Concluido</SelectItem>
              <SelectItem value="returned_to_work">Retornou ao trabalho</SelectItem>
            </SelectContent>
          </Select>
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
                  {(officer.name ?? officer.user?.name ?? officer.war_name) || `Policial #${officer.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de afastamento</Label>
          <Select value={leaveTypeId} onValueChange={onLeaveTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {leaveTypes.map((leaveType) => (
                <SelectItem key={leaveType.id} value={String(leaveType.id)}>
                  {leaveType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date_from">Início a partir de</Label>
          <Input id="start_date_from" type="date" value={startDateFrom} onChange={(event) => onStartDateFromChange(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date_to">Início ate</Label>
          <Input id="start_date_to" type="date" value={startDateTo} onChange={(event) => onStartDateToChange(event.target.value)} />
        </div>

        <Button variant="outline" onClick={onClear}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </CardContent>
    </Card>
  );
}
