"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteSubunitMutation } from "@/hooks/use-subunit-mutations";
import type { SubunitItem } from "@/types/subunit.type";
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

interface SubunitsTableProps {
  subunits: SubunitItem[];
}

function getOfficerLabel(officer: SubunitItem["commander"] | SubunitItem["deputy_commander"]) {
  if (!officer) {
    return "Não informado";
  }

  if (officer.name && officer.registration_number) {
    return `${officer.name} • ${officer.registration_number}`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

export function SubunitsTable({ subunits }: SubunitsTableProps) {
  const permissions = usePermissions("subunits");
  const deleteMutation = useDeleteSubunitMutation();
  const [subunitToDelete, setSubunitToDelete] = useState<SubunitItem | null>(null);

  async function handleDelete() {
    if (!subunitToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(subunitToDelete.id);
    setSubunitToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Subunidade</th>
                <th className="px-4 py-3 font-medium">Estrutura</th>
                <th className="px-4 py-3 font-medium">Comando</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {subunits.map((subunit) => (
                <tr key={subunit.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{subunit.name}</p>
                        <Badge variant="outline">{subunit.abbreviation}</Badge>
                      </div>
                      <p className="mt-1 text-slate-500">{subunit.email || subunit.phone || "Sem contato principal informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-1">
                      <p>Unidade: {subunit.unit ? `${subunit.unit.name} (${subunit.unit.abbreviation})` : "Sem unidade vinculada"}</p>
                      <p>Cidade: {subunit.city ? `${subunit.city.name} (${subunit.city.abbreviation})` : "Sem cidade vinculada"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-1">
                      <p>Comandante: {getOfficerLabel(subunit.commander)}</p>
                      <p>Subcomandante: {getOfficerLabel(subunit.deputy_commander)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/subunits/${subunit.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/subunits/${subunit.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setSubunitToDelete(subunit)}>
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

      <Dialog open={Boolean(subunitToDelete)} onOpenChange={(open) => !open && setSubunitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir subunidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {subunitToDelete?.name}? Se houver usuários, empresas ou responsabilidades vinculadas, a API pode bloquear a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSubunitToDelete(null)}>
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
