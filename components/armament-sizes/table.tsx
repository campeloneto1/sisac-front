"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteArmamentSizeMutation } from "@/hooks/use-armament-size-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ArmamentSizeItem } from "@/types/armament-size.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ArmamentSizesTableProps {
  armamentSizes: ArmamentSizeItem[];
}

export function ArmamentSizesTable({
  armamentSizes,
}: ArmamentSizesTableProps) {
  const permissions = usePermissions("armament-sizes");
  const deleteMutation = useDeleteArmamentSizeMutation();
  const [sizeToDelete, setSizeToDelete] = useState<ArmamentSizeItem | null>(
    null,
  );

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {armamentSizes.map((armamentSize) => (
                <tr
                  key={armamentSize.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {armamentSize.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {armamentSize.slug}
                  </td>
                  <td className="max-w-xl px-4 py-4 text-slate-600">
                    {armamentSize.description || "Sem descrição informada."}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/armament-sizes/${armamentSize.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/armament-sizes/${armamentSize.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setSizeToDelete(armamentSize)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
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
        open={Boolean(sizeToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setSizeToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tamanho de armamento</DialogTitle>
            <DialogDescription>
              Essa ação removera o tamanho
              {sizeToDelete ? ` "${sizeToDelete.name}"` : ""}. Confirme para
              continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSizeToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !sizeToDelete}
              onClick={async () => {
                if (!sizeToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(sizeToDelete.id);
                setSizeToDelete(null);
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
