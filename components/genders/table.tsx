"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteGenderMutation } from "@/hooks/use-gender-mutations";
import type { GenderItem } from "@/types/gender.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GendersTableProps {
  genders: GenderItem[];
}

export function GendersTable({ genders }: GendersTableProps) {
  const permissions = usePermissions("genders");
  const deleteMutation = useDeleteGenderMutation();
  const [genderToDelete, setGenderToDelete] = useState<GenderItem | null>(null);

  async function handleDelete() {
    if (!genderToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(genderToDelete.id);
    setGenderToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Gênero</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {genders.map((gender) => (
                <tr key={gender.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{gender.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo global de gênero usado em outros módulos.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/genders/${gender.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/genders/${gender.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setGenderToDelete(gender)}>
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

      <Dialog open={Boolean(genderToDelete)} onOpenChange={(open) => !open && setGenderToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir gênero</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {genderToDelete?.name}? Se houver policiais ou outros registros vinculados, a API pode bloquear a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGenderToDelete(null)}>
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
