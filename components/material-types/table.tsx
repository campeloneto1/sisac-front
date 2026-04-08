"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteMaterialTypeMutation } from "@/hooks/use-material-type-mutations";
import type { MaterialTypeItem } from "@/types/material-type.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MaterialTypesTableProps {
  materialTypes: MaterialTypeItem[];
}

export function MaterialTypesTable({
  materialTypes,
}: MaterialTypesTableProps) {
  const permissions = usePermissions("material-types");
  const deleteMutation = useDeleteMaterialTypeMutation();
  const [materialTypeToDelete, setMaterialTypeToDelete] =
    useState<MaterialTypeItem | null>(null);

  async function handleDelete() {
    if (!materialTypeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(materialTypeToDelete.id);
    setMaterialTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Atualização</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {materialTypes.map((materialType) => (
                <tr
                  key={materialType.id}
                  className="border-t border-slate-200/70 align-top"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {materialType.name}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Classificação administrativa global para materiais.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {materialType.slug}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {materialType.description?.trim() || "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {materialType.updated_at ?? materialType.created_at ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/material-types/${materialType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/material-types/${materialType.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setMaterialTypeToDelete(materialType)}
                        >
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

      <Dialog
        open={Boolean(materialTypeToDelete)}
        onOpenChange={(open) => !open && setMaterialTypeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de material</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {materialTypeToDelete?.name}? Se
              houver materiais vinculados, a API podera recusar a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMaterialTypeToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
