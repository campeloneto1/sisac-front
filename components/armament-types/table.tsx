"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteArmamentTypeMutation } from "@/hooks/use-armament-type-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ArmamentTypeItem } from "@/types/armament-type.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ArmamentTypesTableProps {
  armamentTypes: ArmamentTypeItem[];
}

export function ArmamentTypesTable({
  armamentTypes,
}: ArmamentTypesTableProps) {
  const permissions = usePermissions("armament-types");
  const deleteMutation = useDeleteArmamentTypeMutation();
  const [typeToDelete, setTypeToDelete] = useState<ArmamentTypeItem | null>(
    null,
  );

  async function handleDelete() {
    if (!typeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(typeToDelete.id);
    setTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Tipo de Controle</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {armamentTypes.map((armamentType) => (
                <tr
                  key={armamentType.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {armamentType.name}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {armamentType.slug}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        armamentType.control_type === "unit"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {armamentType.control_type_label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {armamentType.description ?? "Sem descrição"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/armament-types/${armamentType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/armament-types/${armamentType.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setTypeToDelete(armamentType)}
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
        open={Boolean(typeToDelete)}
        onOpenChange={(open) => !open && setTypeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de armamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o tipo{" "}
              {typeToDelete?.name ?? "selecionado"}? Essa ação não podera ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTypeToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending
                ? "Excluindo..."
                : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
