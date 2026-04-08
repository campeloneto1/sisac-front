"use client";

import { Search, X } from "lucide-react";

import { noticePriorityOptions, noticeStatusOptions, noticeTypeOptions, noticeVisibilityOptions } from "@/types/notice.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NoticesFiltersProps {
  search: string;
  type: string;
  visibility: string;
  priority: string;
  status: string;
  isActive: string;
  isPinned: string;
  requiresAcknowledgement: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onIsPinnedChange: (value: string) => void;
  onRequiresAcknowledgementChange: (value: string) => void;
  onClear: () => void;
}

function BooleanFilter({
  value,
  placeholder,
  trueLabel,
  falseLabel,
  onValueChange,
}: {
  value: string;
  placeholder: string;
  trueLabel: string;
  falseLabel: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        <SelectItem value="true">{trueLabel}</SelectItem>
        <SelectItem value="false">{falseLabel}</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function NoticesFilters({
  search,
  type,
  visibility,
  priority,
  status,
  isActive,
  isPinned,
  requiresAcknowledgement,
  onSearchChange,
  onTypeChange,
  onVisibilityChange,
  onPriorityChange,
  onStatusChange,
  onIsActiveChange,
  onIsPinnedChange,
  onRequiresAcknowledgementChange,
  onClear,
}: NoticesFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="relative md:col-span-2 xl:col-span-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por título ou conteúdo"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {noticeTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={visibility} onValueChange={onVisibilityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as visibilidades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as visibilidades</SelectItem>
          {noticeVisibilityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as prioridades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as prioridades</SelectItem>
          {noticePriorityOptions.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {noticeStatusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <BooleanFilter
        value={isActive}
        placeholder="Ativação"
        trueLabel="Somente ativos"
        falseLabel="Somente inativos"
        onValueChange={onIsActiveChange}
      />

      <BooleanFilter
        value={isPinned}
        placeholder="Fixação"
        trueLabel="Somente fixados"
        falseLabel="Somente não fixados"
        onValueChange={onIsPinnedChange}
      />

      <BooleanFilter
        value={requiresAcknowledgement}
        placeholder="Confirmação"
        trueLabel="Exigem ciência"
        falseLabel="Não exigem ciência"
        onValueChange={onRequiresAcknowledgementChange}
      />

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
