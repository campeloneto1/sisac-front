"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeletePatrimonyMutation } from "@/hooks/use-patrimony-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getPatrimonyStatusVariant,
  type PatrimonyItem,
} from "@/types/patrimony.type";
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

interface PatrimoniesTableProps {
  patrimonies: PatrimonyItem[];
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

export function PatrimoniesTable({ patrimonies }: PatrimoniesTableProps) {
  const permissions = usePermissions("patrimonies");
  const deleteMutation = useDeletePatrimonyMutation();
  const [patrimonyToDelete, setPatrimonyToDelete] =
    useState<PatrimonyItem | null>(null);

  async function handleDelete() {
    if (!patrimonyToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(patrimonyToDelete.id);
    setPatrimonyToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Patrimonio</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Setor atual</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Atualizacao</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {patrimonies.map((patrimony) => (
                <tr
                  key={patrimony.id}
                  className="border-t border-slate-200/70 align-top"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{patrimony.code}</p>
                    <p className="mt-1 text-slate-500">
                      {patrimony.serial_number || patrimony.description || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {patrimony.patrimony_type?.name || "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {patrimony.current_sector?.abbreviation ||
                      patrimony.current_sector?.name ||
                      "Sem setor"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getPatrimonyStatusVariant(patrimony.status?.value)}>
                      {patrimony.status?.label || "-"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {formatDateTime(patrimony.updated_at ?? patrimony.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/patrimonies/${patrimony.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/patrimonies/${patrimony.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setPatrimonyToDelete(patrimony)}
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
        open={Boolean(patrimonyToDelete)}
        onOpenChange={(open) => !open && setPatrimonyToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir patrimonio</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {patrimonyToDelete?.code}? Se
              houver vinculos de negocio, a API pode recusar a remocao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPatrimonyToDelete(null)}
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
