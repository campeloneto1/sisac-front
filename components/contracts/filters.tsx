"use client";

import { Search, X } from "lucide-react";

import type { CompanyItem } from "@/types/company.type";
import { contractStatusOptions } from "@/types/contract.type";
import type { ContractTypeItem } from "@/types/contract-type.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContractsFiltersProps {
  search: string;
  status: string;
  companyId: string;
  contractTypeId: string;
  isActive: string;
  companies: CompanyItem[];
  contractTypes: ContractTypeItem[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onContractTypeChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onClear: () => void;
}

export function ContractsFilters({
  search,
  status,
  companyId,
  contractTypeId,
  isActive,
  companies,
  contractTypes,
  onSearchChange,
  onStatusChange,
  onCompanyChange,
  onContractTypeChange,
  onIsActiveChange,
  onClear,
}: ContractsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[1.4fr_220px_240px_240px_180px_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por numero do contrato ou SACC"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {contractStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={companyId} onValueChange={onCompanyChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={String(company.id)}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={contractTypeId} onValueChange={onContractTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {contractTypes.map((contractType) => (
            <SelectItem key={contractType.id} value={String(contractType.id)}>
              {contractType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={isActive} onValueChange={onIsActiveChange}>
        <SelectTrigger>
          <SelectValue placeholder="Situacao" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Ativos</SelectItem>
          <SelectItem value="false">Inativos</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
