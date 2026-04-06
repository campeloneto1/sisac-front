"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteAssignmentMutation } from "@/hooks/use-assignment-mutations";
import type { AssignmentItem } from "@/types/assignment.type";
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

interface AssignmentsTableProps {
  assignments: AssignmentItem[];
}

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  const permissions = usePermissions("assignments");
  const deleteMutation = useDeleteAssignmentMutation();
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentItem | null>(null);

  async function handleDelete() {
    if (!assignmentToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(assignmentToDelete.id);
    setAssignmentToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Função/atribuição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{assignment.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro mestre usado nas alocações dos policiais.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {assignment.category ? (
                      <Badge variant="secondary" className="capitalize">
                        {assignment.category}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">Sem categoria</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/assignments/${assignment.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/assignments/${assignment.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setAssignmentToDelete(assignment)}>
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

      <Dialog open={Boolean(assignmentToDelete)} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir função/atribuição</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {assignmentToDelete?.name}? Se houver alocações vinculadas, a API pode bloquear a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignmentToDelete(null)}>
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
