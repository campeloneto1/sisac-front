"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteLeaveTypeMutation } from "@/hooks/use-leave-type-mutations";
import type { LeaveTypeItem } from "@/types/leave-type.type";
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

interface LeaveTypesTableProps {
  leaveTypes: LeaveTypeItem[];
}

export function LeaveTypesTable({ leaveTypes }: LeaveTypesTableProps) {
  const permissions = usePermissions("leave-types");
  const deleteMutation = useDeleteLeaveTypeMutation();
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState<LeaveTypeItem | null>(null);

  async function handleDelete() {
    if (!leaveTypeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(leaveTypeToDelete.id);
    setLeaveTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo de afastamento</th>
                <th className="px-4 py-3 font-medium">Regras</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((leaveType) => (
                <tr key={leaveType.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{leaveType.name}</p>
                      <p className="mt-1 text-slate-500">{leaveType.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={leaveType.requires_medical_report ? "default" : "secondary"}>
                        {leaveType.requires_medical_report ? "Exige laudo" : "Sem laudo"}
                      </Badge>
                      <Badge variant={leaveType.affects_salary ? "destructive" : "secondary"}>
                        {leaveType.affects_salary ? "Afeta salario" : "Nao afeta salario"}
                      </Badge>
                      {leaveType.max_days ? (
                        <Badge variant="outline">Maximo de {leaveType.max_days} dias</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/leave-types/${leaveType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/leave-types/${leaveType.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setLeaveTypeToDelete(leaveType)}>
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

      <Dialog open={Boolean(leaveTypeToDelete)} onOpenChange={(open) => !open && setLeaveTypeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de afastamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {leaveTypeToDelete?.name}? Se ja existirem afastamentos vinculados, a API pode bloquear a exclusao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLeaveTypeToDelete(null)}>
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
