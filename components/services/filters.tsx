"use client";

import { Search, X } from "lucide-react";

import type { CompanyItem } from "@/types/company.type";
import type { SectorItem } from "@/types/sector.type";
import type { ServiceTypeItem } from "@/types/service-type.type";
import { servicePriorityOptions, serviceStatusOptions } from "@/types/service.type";
import type { UserListItem } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServicesFiltersProps {
  search: string;
  companyId: string;
  serviceTypeId: string;
  status: string;
  priority: string;
  requestedBy: string;
  sectorId: string;
  scheduledDateFrom: string;
  scheduledDateTo: string;
  companies: Pick<CompanyItem, "id" | "name" | "trade_name">[];
  serviceTypes: Pick<ServiceTypeItem, "id" | "name" | "code">[];
  users: Pick<UserListItem, "id" | "name" | "email">[];
  sectors: Pick<SectorItem, "id" | "name" | "abbreviation">[];
  onSearchChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onServiceTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onRequestedByChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onScheduledDateFromChange: (value: string) => void;
  onScheduledDateToChange: (value: string) => void;
  onClear: () => void;
}

export function ServicesFilters({
  search,
  companyId,
  serviceTypeId,
  status,
  priority,
  requestedBy,
  sectorId,
  scheduledDateFrom,
  scheduledDateTo,
  companies,
  serviceTypes,
  users,
  sectors,
  onSearchChange,
  onCompanyChange,
  onServiceTypeChange,
  onStatusChange,
  onPriorityChange,
  onRequestedByChange,
  onSectorChange,
  onScheduledDateFromChange,
  onScheduledDateToChange,
  onClear,
}: ServicesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 xl:grid-cols-4">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por descricao ou localizacao"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={companyId} onValueChange={onCompanyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={String(company.id)}>
              {company.trade_name || company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={serviceTypeId} onValueChange={onServiceTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Tipo de servico" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {serviceTypes.map((serviceType) => (
            <SelectItem key={serviceType.id} value={String(serviceType.id)}>
              {serviceType.name}
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
          {serviceStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as prioridades</SelectItem>
          {servicePriorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={requestedBy} onValueChange={onRequestedByChange}>
        <SelectTrigger>
          <SelectValue placeholder="Solicitante" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os solicitantes</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={String(user.id)}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {sector.abbreviation
                ? `${sector.abbreviation} • ${sector.name}`
                : sector.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={scheduledDateFrom}
        onChange={(event) => onScheduledDateFromChange(event.target.value)}
      />

      <Input
        type="date"
        value={scheduledDateTo}
        onChange={(event) => onScheduledDateToChange(event.target.value)}
      />

      <div className="xl:col-span-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
