"use client";

import { X } from "lucide-react";

import type { NotificationDomainOption, NotificationResponsibilityItem } from "@/types/notification-responsibility.type";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationResponsibilitiesFiltersProps {
  domain: string;
  subunitId: string;
  sectorId: string;
  subunits: Array<NonNullable<NotificationResponsibilityItem["subunit"]>>;
  sectors: Array<NonNullable<NotificationResponsibilityItem["sector"]>>;
  domains: NotificationDomainOption[];
  onDomainChange: (value: string) => void;
  onSubunitChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onClear: () => void;
}

export function NotificationResponsibilitiesFilters({
  domain,
  subunitId,
  sectorId,
  subunits,
  sectors,
  domains,
  onDomainChange,
  onSubunitChange,
  onSectorChange,
  onClear,
}: NotificationResponsibilitiesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-[220px_240px_240px_auto]">
      <Select value={domain} onValueChange={onDomainChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por dominio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os dominios</SelectItem>
          {domains.map((domainOption) => (
            <SelectItem key={domainOption.value} value={domainOption.value}>
              {domainOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={subunitId} onValueChange={onSubunitChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por subunidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as subunidades</SelectItem>
          {subunits.map((subunit) => (
            <SelectItem key={subunit.id} value={String(subunit.id)}>
              {subunit.name} {subunit.abbreviation ? `• ${subunit.abbreviation}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sectorId} onValueChange={onSectorChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os setores</SelectItem>
          {sectors.map((sector) => (
            <SelectItem key={sector.id} value={String(sector.id)}>
              {sector.name} {sector.abbreviation ? `• ${sector.abbreviation}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
