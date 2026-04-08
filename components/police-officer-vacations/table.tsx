"use client";

import Link from "next/link";
import { CalendarRange, Eye, Pencil, Trash2 } from "lucide-react";

import { useDeletePoliceOfficerVacationMutation } from "@/hooks/use-police-officer-vacation-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { PoliceOfficerVacationItem } from "@/types/police-officer-vacation.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-3">
      {vacations.map((vacation) => (
        <Card key={vacation.id} className="border-slate-200/70 bg-white/80">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {vacation.police_officer?.name ?? vacation.police_officer?.user?.name ?? vacation.police_officer?.war_name ?? `Policial #${vacation.police_officer_id}`}
                </p>
                <Badge variant={getStatusVariant(vacation.status?.value)}>{vacation.status?.label ?? "Sem status"}</Badge>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  Ano {vacation.reference_year}
                </span>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-primary" />
                  <span>Validade: {vacation.valid_from ?? "-"} ate {vacation.valid_until ?? "-"}</span>
                </div>
                <div>Total: {vacation.total_days} dias</div>
                <div>Usados: {vacation.used_days ?? 0} dias</div>
                <div>Disponíveis: {vacation.available_days ?? vacation.remaining_days ?? 0} dias</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
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
                <Button size="icon" variant="outline" disabled={deleteMutation.isPending} onClick={() => void deleteMutation.mutateAsync(vacation.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
