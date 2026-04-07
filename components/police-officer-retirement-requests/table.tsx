"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePoliceOfficerRetirementRequestMutation } from "@/hooks/use-police-officer-retirement-request-mutations";
import type { PoliceOfficerRetirementRequestItem } from "@/types/police-officer-retirement-request.type";
import { RETIREMENT_REQUEST_STATUS_LABELS } from "@/types/police-officer-retirement-request.type";
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

function getStatusVariant(
  status: PoliceOfficerRetirementRequestItem["status"],
) {
  switch (status) {
    case "approved":
    case "published":
      return "success";
    case "denied":
    case "cancelled":
      return "danger";
    case "in_analysis":
      return "warning";
    case "requested":
    default:
      return "secondary";
  }
}

interface PoliceOfficerRetirementRequestsTableProps {
  policeOfficerRetirementRequests: PoliceOfficerRetirementRequestItem[];
}

export function PoliceOfficerRetirementRequestsTable({
  policeOfficerRetirementRequests,
}: PoliceOfficerRetirementRequestsTableProps) {
  const permissions = usePermissions("police-officer-retirement-requests");
  const deleteMutation = useDeletePoliceOfficerRetirementRequestMutation();
  const [requestToDelete, setRequestToDelete] =
    useState<PoliceOfficerRetirementRequestItem | null>(null);

  async function handleDelete() {
    if (!requestToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(requestToDelete.id);
    setRequestToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">NUP</th>
                <th className="px-4 py-3 font-medium">Data requerimento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Boletim req.</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {policeOfficerRetirementRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {request.police_officer?.war_name ??
                          request.police_officer?.user?.name ??
                          `Policial #${request.police_officer_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Matricula:{" "}
                        {request.police_officer?.registration_number ??
                          "Nao informada"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {request.nup ?? "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {request.requested_at ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusVariant(request.status)}>
                      {RETIREMENT_REQUEST_STATUS_LABELS[request.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {request.bulletin_request ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/police-officer-retirement-requests/${request.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/police-officer-retirement-requests/${request.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setRequestToDelete(request)}
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
        open={Boolean(requestToDelete)}
        onOpenChange={(open) => !open && setRequestToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir requerimento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o requerimento de aposentadoria
              {requestToDelete?.nup ? ` (NUP: ${requestToDelete.nup})` : ""} de{" "}
              {requestToDelete?.police_officer?.war_name ??
                requestToDelete?.police_officer?.user?.name}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRequestToDelete(null)}>
              Cancelar
            </Button>
            <Button
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
