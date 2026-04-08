"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteMaterialMutation } from "@/hooks/use-material-mutations";
import type { MaterialItem } from "@/types/material.type";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MaterialsTableProps {
  materials: MaterialItem[];
}

export function MaterialsTable({ materials }: MaterialsTableProps) {
  const permissions = usePermissions("materials");
  const deleteMutation = useDeleteMaterialMutation();
  const [materialToDelete, setMaterialToDelete] = useState<MaterialItem | null>(null);

  async function handleDelete() {
    if (!materialToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(materialToDelete.id);
    setMaterialToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Variante</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Unidades</th>
                <th className="px-4 py-3 font-medium">Lotes</th>
                <th className="px-4 py-3 font-medium">Atualização</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-t border-slate-200/70 align-top">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{material.type?.name ?? "Tipo não informado"}</p>
                      <p className="mt-1 text-slate-500">{material.type?.slug ?? "-"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{material.variant?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{material.variant?.brand?.name ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{material.units_count ?? 0}</td>
                  <td className="px-4 py-4 text-slate-600">{material.batches_count ?? 0}</td>
                  <td className="px-4 py-4 text-slate-600">{material.updated_at ?? material.created_at ?? "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/materials/${material.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/materials/${material.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setMaterialToDelete(material)}>
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

      <Dialog open={Boolean(materialToDelete)} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir material</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este material? Se houver vínculos operacionais, a API pode recusar a remoção.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setMaterialToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
