"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteEducationLevelMutation } from "@/hooks/use-education-level-mutations";
import type { EducationLevelItem } from "@/types/education-level.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EducationLevelsTableProps {
  educationLevels: EducationLevelItem[];
}

export function EducationLevelsTable({ educationLevels }: EducationLevelsTableProps) {
  const permissions = usePermissions("education-levels");
  const deleteMutation = useDeleteEducationLevelMutation();
  const [educationLevelToDelete, setEducationLevelToDelete] = useState<EducationLevelItem | null>(null);

  async function handleDelete() {
    if (!educationLevelToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(educationLevelToDelete.id);
    setEducationLevelToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nivel de escolaridade</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {educationLevels.map((educationLevel) => (
                <tr key={educationLevel.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{educationLevel.name}</p>
                      <p className="mt-1 text-slate-500">
                        Cadastro administrativo global usado como base em formularios e registros de policiais.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/education-levels/${educationLevel.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/education-levels/${educationLevel.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setEducationLevelToDelete(educationLevel)}>
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

      <Dialog open={Boolean(educationLevelToDelete)} onOpenChange={(open) => !open && setEducationLevelToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir nivel de escolaridade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {educationLevelToDelete?.name}? Se houver policiais ou outros registros vinculados,
              a API pode bloquear a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEducationLevelToDelete(null)}>
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
