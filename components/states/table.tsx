"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteStateMutation } from "@/hooks/use-state-mutations";
import type { StateItem } from "@/types/state.type";
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

interface StatesTableProps {
  states: StateItem[];
}

export function StatesTable({ states }: StatesTableProps) {
  const permissions = usePermissions("states");
  const deleteMutation = useDeleteStateMutation();
  const [stateToDelete, setStateToDelete] = useState<StateItem | null>(null);

  async function handleDelete() {
    if (!stateToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(stateToDelete.id);
    setStateToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Sigla</th>
                <th className="px-4 py-3 font-medium">Pais</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {states.map((state) => (
                <tr key={state.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{state.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo territorial vinculado a um pais.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{state.abbreviation}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {state.country ? `${state.country.name} (${state.country.abbreviation})` : "Sem pais vinculado"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/states/${state.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/states/${state.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setStateToDelete(state)}>
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

      <Dialog open={Boolean(stateToDelete)} onOpenChange={(open) => !open && setStateToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir estado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {stateToDelete?.name}? Essa acao remove o estado do cadastro administrativo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStateToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
