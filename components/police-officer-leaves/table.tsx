"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePoliceOfficerLeaveMutation } from "@/hooks/use-police-officer-leave-mutations";
import type { PoliceOfficerLeaveItem } from "@/types/police-officer-leave.type";
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

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "approved":
    case "copem_approved":
    case "returned_to_work":
      return "success";
    case "rejected":
    case "copem_rejected":
      return "danger";
    case "awaiting_copem":
    case "copem_scheduled":
    case "in_copem_evaluation":
      return "warning";
    case "ongoing":
    case "requested":
      return "info";
    default:
      return "secondary";
  }
}

interface PoliceOfficerLeavesTableProps {
  policeOfficerLeaves: PoliceOfficerLeaveItem[];
}

export function PoliceOfficerLeavesTable({ policeOfficerLeaves }: PoliceOfficerLeavesTableProps) {
  const permissions = usePermissions("police-officer-leaves");
  const deleteMutation = useDeletePoliceOfficerLeaveMutation();
  const [leaveToDelete, setLeaveToDelete] = useState<PoliceOfficerLeaveItem | null>(null);

  async function handleDelete() {
    if (!leaveToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(leaveToDelete.id);
    setLeaveToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Periodo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">COPEM</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {policeOfficerLeaves.map((leave) => (
                <tr key={leave.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {leave.police_officer?.name ?? leave.police_officer?.user?.name ?? leave.police_officer?.war_name ?? `Policial #${leave.police_officer_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">Matricula: {leave.police_officer?.registration_number ?? "Nao informada"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{leave.leave_type?.name ?? `Tipo #${leave.leave_type_id}`}</p>
                      <p className="mt-1 text-slate-500">{leave.leave_type?.slug ?? "Sem slug"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>
                        {leave.start_date ?? "-"} ate {leave.end_date ?? "-"}
                      </p>
                      <p className="mt-1 text-slate-500">{leave.days ? `${leave.days} dias` : "Periodo sem total calculado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStatusVariant(leave.status?.value)}>{leave.status?.label ?? "Sem status"}</Badge>
                      {leave.is_renewal ? <Badge variant="outline">Renovacao</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={leave.requires_copem ? "warning" : "secondary"}>
                        {leave.requires_copem ? "Requer COPEM" : "Sem COPEM"}
                      </Badge>
                      {leave.copem_result ? <Badge variant="outline">{leave.copem_result.label}</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/police-officer-leaves/${leave.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/police-officer-leaves/${leave.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setLeaveToDelete(leave)}>
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

      <Dialog open={Boolean(leaveToDelete)} onOpenChange={(open) => !open && setLeaveToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir afastamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o afastamento de{" "}
              {leaveToDelete?.police_officer?.name ?? leaveToDelete?.police_officer?.user?.name ?? leaveToDelete?.police_officer?.war_name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLeaveToDelete(null)}>
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
