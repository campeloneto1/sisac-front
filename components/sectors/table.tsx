"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteSectorMutation } from "@/hooks/use-sector-mutations";
import type { SectorItem } from "@/types/sector.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getOfficerLabel(officer: { id: number; name?: string | null; registration_number?: string | null } | null | undefined) {
  if (!officer) {
    return "Não informado";
  }

  if (officer.name && officer.registration_number) {
    return `${officer.name} • ${officer.registration_number}`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

interface SectorsTableProps {
  sectors: SectorItem[];
}

export function SectorsTable({ sectors }: SectorsTableProps) {
  const permissions = usePermissions("sectors");
  const deleteMutation = useDeleteSectorMutation();
  const [sectorToDelete, setSectorToDelete] = useState<SectorItem | null>(null);

  async function handleDelete() {
    if (!sectorToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(sectorToDelete.id);
    setSectorToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Setor</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Comando</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => (
                <tr key={sector.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{sector.name}</p>
                      <p className="mt-1 text-slate-500">Sigla: {sector.abbreviation ?? "Não informada"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{sector.email ?? "Sem email"}</p>
                      <p className="mt-1 text-slate-500">{sector.phone ?? "Sem telefone"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>Cmd: {getOfficerLabel(sector.commander)}</p>
                      <p className="mt-1 text-slate-500">Subcmd: {getOfficerLabel(sector.deputy_commander)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/sectors/${sector.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/sectors/${sector.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setSectorToDelete(sector)}>
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

      <Dialog open={Boolean(sectorToDelete)} onOpenChange={(open) => !open && setSectorToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir setor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {sectorToDelete?.name}? Se este setor estiver em uso em alocações ou fluxos internos,
              a remoção pode impactar a operação da subunidade.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSectorToDelete(null)}>
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
