"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteArmamentCaliberMutation } from "@/hooks/use-armament-caliber-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ArmamentCaliberItem } from "@/types/armament-caliber.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ArmamentCalibersTableProps {
  armamentCalibers: ArmamentCaliberItem[];
}

export function ArmamentCalibersTable({
  armamentCalibers,
}: ArmamentCalibersTableProps) {
  const permissions = usePermissions("armament-calibers");
  const deleteMutation = useDeleteArmamentCaliberMutation();
  const [caliberToDelete, setCaliberToDelete] =
    useState<ArmamentCaliberItem | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Descricao</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {armamentCalibers.map((armamentCaliber) => (
                <tr
                  key={armamentCaliber.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {armamentCaliber.name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {armamentCaliber.slug}
                  </td>
                  <td className="max-w-xl px-4 py-4 text-slate-600">
                    {armamentCaliber.description || "Sem descricao informada."}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/armament-calibers/${armamentCaliber.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/armament-calibers/${armamentCaliber.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setCaliberToDelete(armamentCaliber)}
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
        open={Boolean(caliberToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCaliberToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir calibre de armamento</DialogTitle>
            <DialogDescription>
              Essa acao removera o calibre
              {caliberToDelete ? ` "${caliberToDelete.name}"` : ""}. Confirme
              para continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCaliberToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !caliberToDelete}
              onClick={async () => {
                if (!caliberToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(caliberToDelete.id);
                setCaliberToDelete(null);
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
