"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import type { PoliceOfficerItem } from "@/types/police-officer.type";
import type { PublicationTypeItem } from "@/types/publication-type.type";
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

interface PoliceOfficerPublicationsFiltersProps {
  search: string;
  policeOfficerId: string;
  publicationTypeId: string;
  publicationDateFrom: string;
  publicationDateTo: string;
  policeOfficers: PoliceOfficerItem[];
  publicationTypes: PublicationTypeItem[];
  onSearchChange: (value: string) => void;
  onPoliceOfficerChange: (value: string) => void;
  onPublicationTypeChange: (value: string) => void;
  onPublicationDateFromChange: (value: string) => void;
  onPublicationDateToChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerPublicationsFilters({
  search,
  policeOfficerId,
  publicationTypeId,
  publicationDateFrom,
  publicationDateTo,
  policeOfficers,
  publicationTypes,
  onSearchChange,
  onPoliceOfficerChange,
  onPublicationTypeChange,
  onPublicationDateFromChange,
  onPublicationDateToChange,
  onClear,
}: PoliceOfficerPublicationsFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.9fr_auto] xl:items-end">
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label htmlFor="police-officer-publication-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="police-officer-publication-search"
              className="pl-9"
              placeholder="Boletim, conteudo, link, policial..."
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
          <Label>Tipo de publicação</Label>
          <Select
            value={publicationTypeId}
            onValueChange={onPublicationTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {publicationTypes.map((publicationType) => (
                <SelectItem
                  key={publicationType.id}
                  value={String(publicationType.id)}
                >
                  {publicationType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publication_date_from">Data a partir de</Label>
          <Input
            id="publication_date_from"
            type="date"
            value={publicationDateFrom}
            onChange={(event) =>
              onPublicationDateFromChange(event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publication_date_to">Data ate</Label>
          <Input
            id="publication_date_to"
            type="date"
            value={publicationDateTo}
            onChange={(event) => onPublicationDateToChange(event.target.value)}
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
