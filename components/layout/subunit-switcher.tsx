"use client";

import { Building2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function SubunitSwitcher() {
  const { isReady } = useAuth();
  const { activeSubunit, subunits, setActiveSubunit } = useSubunit();

  if (!isReady) {
    return (
      <div className="flex min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 xl:min-w-[260px]">
        <div className="rounded-lg bg-secondary p-2 text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subunidade</p>
          <p className="text-sm text-slate-500">Carregando contexto...</p>
        </div>
      </div>
    );
  }

  if (!subunits.length) {
    return (
      <div className="flex min-w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 xl:min-w-[260px]">
        <div className="rounded-lg bg-secondary p-2 text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subunidade</p>
          <p className="text-sm text-slate-500">Nenhuma subunidade disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
      <div className="rounded-lg bg-secondary p-2 text-primary">
        <Building2 className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subunidade</p>
        <SearchableSelect
          value={activeSubunit ? String(activeSubunit.id) : undefined}
          onValueChange={setActiveSubunit}
          placeholder="Selecione a subunidade"
          searchPlaceholder="Buscar subunidade..."
          emptyMessage="Nenhuma subunidade encontrada."
          triggerClassName="h-auto min-w-[180px] border-0 px-0 py-0 shadow-none focus:ring-0 xl:min-w-[220px]"
          options={subunits.map((subunit) => ({
            value: String(subunit.id),
            label: subunit.abbreviation ? `${subunit.name} • ${subunit.abbreviation}` : subunit.name,
            keywords: [subunit.name, subunit.abbreviation ?? ""],
          }))}
        />
      </div>
    </div>
  );
}
