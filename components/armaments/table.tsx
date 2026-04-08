"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteArmamentMutation } from "@/hooks/use-armament-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ArmamentItem } from "@/types/armament.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ArmamentsTableProps {
  armaments: ArmamentItem[];
}

export function ArmamentsTable({ armaments }: ArmamentsTableProps) {
  const permissions = usePermissions("armaments");
  const deleteMutation = useDeleteArmamentMutation();
  const [armamentToDelete, setArmamentToDelete] =
    useState<ArmamentItem | null>(null);

  function getArmamentLabel(armament: ArmamentItem) {
    return [armament.type?.name, armament.variant?.name].filter(Boolean).join(" ");
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Armamento</th>
                <th className="px-4 py-3 font-medium">Classificação</th>
                <th className="px-4 py-3 font-medium">Subunidade</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {armaments.map((armament) => (
                <tr key={armament.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {getArmamentLabel(armament) || `Armamento #${armament.id}`}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {armament.variant?.brand?.name
                        ? `Marca: ${armament.variant.brand.name}`
                        : "Marca não informada"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>
                      {armament.caliber?.name || "Sem calibre"} /{" "}
                      {armament.size?.name || "Sem tamanho"}
                    </p>
                    <p className="mt-1">
                      {armament.gender?.name || "Sem gênero"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {armament.subunit?.abbreviation || armament.subunit?.name || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/armaments/${armament.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Visualizar</span>
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/armaments/${armament.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setArmamentToDelete(armament)}
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
        open={Boolean(armamentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setArmamentToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir armamento</DialogTitle>
            <DialogDescription>
              Essa ação removera o armamento
              {armamentToDelete ? ` "${getArmamentLabel(armamentToDelete)}"` : ""}
              . Confirme para continuar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setArmamentToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !armamentToDelete}
              onClick={async () => {
                if (!armamentToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(armamentToDelete.id);
                setArmamentToDelete(null);
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
