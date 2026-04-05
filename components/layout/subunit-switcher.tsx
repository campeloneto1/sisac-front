"use client";

import { Building2 } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SubunitSwitcher() {
  const { activeSubunit, subunits, setActiveSubunit } = useSubunit();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <div className="rounded-xl bg-secondary p-2 text-primary">
        <Building2 className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Subunidade</p>
        <Select value={activeSubunit?.id} onValueChange={setActiveSubunit}>
          <SelectTrigger className="h-auto min-w-[220px] border-0 px-0 py-0 shadow-none focus:ring-0">
            <SelectValue placeholder="Selecione a subunidade" />
          </SelectTrigger>
          <SelectContent>
            {subunits.map((subunit) => (
              <SelectItem key={subunit.id} value={subunit.id}>
                {subunit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

