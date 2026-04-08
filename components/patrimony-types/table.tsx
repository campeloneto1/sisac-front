"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeletePatrimonyTypeMutation } from "@/hooks/use-patrimony-type-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { PatrimonyTypeItem } from "@/types/patrimony-type.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PatrimonyTypesTableProps {
  patrimonyTypes: PatrimonyTypeItem[];
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PatrimonyTypesTable({
  patrimonyTypes,
}: PatrimonyTypesTableProps) {
  const permissions = usePermissions("patrimony-types");
  const deleteMutation = useDeletePatrimonyTypeMutation();
  const [patrimonyTypeToDelete, setPatrimonyTypeToDelete] =
    useState<PatrimonyTypeItem | null>(null);

  async function handleDelete() {
    if (!patrimonyTypeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(patrimonyTypeToDelete.id);
    setPatrimonyTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Descricao</th>
                <th className="px-4 py-3 font-medium">Atualizacao</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {patrimonyTypes.map((patrimonyType) => (
                <tr
                  key={patrimonyType.id}
                  className="border-t border-slate-200/70 align-top"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {patrimonyType.name}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Classificacao administrativa global para patrimonios.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {patrimonyType.description?.trim() || "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDateTime(
                      patrimonyType.updated_at ?? patrimonyType.created_at,
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/patrimony-types/${patrimonyType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/patrimony-types/${patrimonyType.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setPatrimonyTypeToDelete(patrimonyType)}
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
        open={Boolean(patrimonyTypeToDelete)}
        onOpenChange={(open) => !open && setPatrimonyTypeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de patrimonio</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {patrimonyTypeToDelete?.name}? Se
              houver patrimonios vinculados, a API podera recusar a exclusao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPatrimonyTypeToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
