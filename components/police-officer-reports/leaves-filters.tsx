"use client";

import { Search, X } from "lucide-react";

import { POLICE_OFFICER_LEAVE_COPEM_RESULT_OPTIONS, POLICE_OFFICER_LEAVE_STATUS_OPTIONS } from "@/types/police-officer-leave.type";
import { useLeaveTypes } from "@/hooks/use-leave-types";
import { useRanks } from "@/hooks/use-ranks";
import { useSectors } from "@/hooks/use-sectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerLeavesFiltersProps {
  search: string;
  leaveTypeId: string;
  leaveStatus: string;
  requiresCopem: string;
  copemResult: string;
  sectorId: string;
  rankId: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onLeaveTypeChange: (value: string) => void;
  onLeaveStatusChange: (value: string) => void;
  onRequiresCopemChange: (value: string) => void;
  onCopemResultChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onRankChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerLeavesFilters({
  search,
  leaveTypeId,
  leaveStatus,
  requiresCopem,
  copemResult,
  sectorId,
  rankId,
  dateFrom,
  dateTo,
  onSearchChange,
  onLeaveTypeChange,
  onLeaveStatusChange,
  onRequiresCopemChange,
  onCopemResultChange,
  onSectorChange,
  onRankChange,
  onDateFromChange,
  onDateToChange,
  onClear,
}: PoliceOfficerLeavesFiltersProps) {
  const leaveTypesQuery = useLeaveTypes({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 });
  const ranksQuery = useRanks({ per_page: 100 });

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Buscar por policial" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </div>

      <Select value={leaveTypeId} onValueChange={onLeaveTypeChange}>
        <SelectTrigger><SelectValue placeholder="Tipo de afastamento" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {(leaveTypesQuery.data?.data ?? []).map((leaveType) => (
            <SelectItem key={leaveType.id} value={String(leaveType.id)}>{leaveType.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={leaveStatus} onValueChange={onLeaveStatusChange}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {POLICE_OFFICER_LEAVE_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={requiresCopem} onValueChange={onRequiresCopemChange}>
        <SelectTrigger><SelectValue placeholder="COPEM" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">COPEM: todos</SelectItem>
          <SelectItem value="true">Exige COPEM</SelectItem>
          <SelectItem value="false">Sem COPEM</SelectItem>
        </SelectContent>
      </Select>

      <Select value={copemResult} onValueChange={onCopemResultChange}>
        <SelectTrigger><SelectValue placeholder="Resultado COPEM" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os resultados</SelectItem>
          {POLICE_OFFICER_LEAVE_COPEM_RESULT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger><SelectValue placeholder="Setor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {(sectorsQuery.data?.data ?? []).map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>{sector.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rankId} onValueChange={onRankChange}>
        <SelectTrigger><SelectValue placeholder="Graduação" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as graduações</SelectItem>
          {(ranksQuery.data?.data ?? []).map((rank) => (
            <SelectItem key={rank.id} value={String(rank.id)}>{rank.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
      <Input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
