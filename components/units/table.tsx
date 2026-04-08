"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteUnitMutation } from "@/hooks/use-unit-mutations";
import type { UnitItem } from "@/types/unit.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnitsTableProps {
  units: UnitItem[];
}

function getOfficerLabel(officer: UnitItem["commander"] | UnitItem["deputy_commander"]) {
  if (!officer) {
    return "Não informado";
  }

  if (officer.name && officer.registration_number) {
    return `${officer.name} • ${officer.registration_number}`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

export function UnitsTable({ units }: UnitsTableProps) {
  const permissions = usePermissions("units");
  const deleteMutation = useDeleteUnitMutation();
  const [unitToDelete, setUnitToDelete] = useState<UnitItem | null>(null);

  async function handleDelete() {
    if (!unitToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(unitToDelete.id);
    setUnitToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Unidade</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Comando</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{unit.name}</p>
                        <Badge variant="outline">{unit.abbreviation}</Badge>
                      </div>
                      <p className="mt-1 text-slate-500">{unit.email || unit.phone || "Sem contato principal informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{unit.city ? `${unit.city.name} (${unit.city.abbreviation})` : "Sem cidade vinculada"}</td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-1">
                      <p>Comandante: {getOfficerLabel(unit.commander)}</p>
                      <p>Subcomandante: {getOfficerLabel(unit.deputy_commander)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/units/${unit.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/units/${unit.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setUnitToDelete(unit)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(unitToDelete)} onOpenChange={(open) => !open && setUnitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir unidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {unitToDelete?.name}? A API bloqueia a exclusão de unidades que ainda possuem subunidades vinculadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUnitToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
