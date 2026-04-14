"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeletePoliceOfficerVacationMutation } from "@/hooks/use-police-officer-vacation-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { formatBrazilianDate } from "@/lib/date-formatter";
import type { PoliceOfficerVacationItem } from "@/types/police-officer-vacation.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "completed":
      return "success";
    case "expired":
      return "danger";
    case "partial":
      return "warning";
    case "sold":
      return "secondary";
    case "cancelled":
      return "secondary";
    default:
      return "info";
  }
}

interface PoliceOfficerVacationsTableProps {
  vacations: PoliceOfficerVacationItem[];
}

export function PoliceOfficerVacationsTable({ vacations }: PoliceOfficerVacationsTableProps) {
  const permissions = usePermissions("police-officer-vacations");
  const deleteMutation = useDeletePoliceOfficerVacationMutation();

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Policial</th>
              <th className="px-4 py-3 font-medium">Ano</th>
              <th className="px-4 py-3 font-medium">Validade</th>
              <th className="px-4 py-3 font-medium">Dias</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vacations.map((vacation) => (
              <tr key={vacation.id} className="border-t border-slate-200/70">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">
                    {vacation.police_officer
                      ? `${vacation.police_officer.current_rank?.abbreviation ?? ""} ${vacation.police_officer.badge_number ?? ""} ${vacation.police_officer.war_name ?? ""}`.trim() || `Policial #${vacation.police_officer_id}`
                      : `Policial #${vacation.police_officer_id}`}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {vacation.reference_year}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <p>{formatBrazilianDate(vacation.valid_from)}</p>
                  <p>{formatBrazilianDate(vacation.valid_until)}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <p>Total: {vacation.total_days}</p>
                  <p>Usados: {vacation.used_days ?? 0}</p>
                  <p>Disponíveis: {vacation.available_days ?? vacation.remaining_days ?? 0}</p>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={getStatusVariant(vacation.status?.value)}>
                    {vacation.status?.label ?? "Sem status"}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    {permissions.canView ? (
                      <Button asChild size="icon" variant="outline">
                        <Link href={`/police-officer-vacations/${vacation.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                    {permissions.canUpdate ? (
                      <Button asChild size="icon" variant="outline">
                        <Link href={`/police-officer-vacations/${vacation.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                    {permissions.canDelete ? (
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={deleteMutation.isPending}
                        onClick={() => void deleteMutation.mutateAsync(vacation.id)}
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
  );
}
