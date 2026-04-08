"use client";

import { Search, X } from "lucide-react";

import { RETIREMENT_REQUEST_STATUS_OPTIONS } from "@/types/police-officer-retirement-request.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerRetirementFiltersProps {
  search: string;
  retirementStatus: string;
  requestedFrom: string;
  requestedTo: string;
  approvedFrom: string;
  approvedTo: string;
  publishedFrom: string;
  publishedTo: string;
  onSearchChange: (value: string) => void;
  onRetirementStatusChange: (value: string) => void;
  onRequestedFromChange: (value: string) => void;
  onRequestedToChange: (value: string) => void;
  onApprovedFromChange: (value: string) => void;
  onApprovedToChange: (value: string) => void;
  onPublishedFromChange: (value: string) => void;
  onPublishedToChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerRetirementFilters(props: PoliceOfficerRetirementFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Buscar por policial" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} />
      </div>
      <Select value={props.retirementStatus} onValueChange={props.onRetirementStatusChange}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {RETIREMENT_REQUEST_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" value={props.requestedFrom} onChange={(event) => props.onRequestedFromChange(event.target.value)} />
      <Input type="date" value={props.requestedTo} onChange={(event) => props.onRequestedToChange(event.target.value)} />
      <Input type="date" value={props.approvedFrom} onChange={(event) => props.onApprovedFromChange(event.target.value)} />
      <Input type="date" value={props.approvedTo} onChange={(event) => props.onApprovedToChange(event.target.value)} />
      <Input type="date" value={props.publishedFrom} onChange={(event) => props.onPublishedFromChange(event.target.value)} />
      <Input type="date" value={props.publishedTo} onChange={(event) => props.onPublishedToChange(event.target.value)} />
      <Button type="button" variant="outline" onClick={props.onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
