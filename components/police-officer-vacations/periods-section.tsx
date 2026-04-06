"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";

import { useDeletePoliceOfficerVacationPeriodMutation } from "@/hooks/use-police-officer-vacation-mutations";
import { usePoliceOfficerVacationPeriods } from "@/hooks/use-police-officer-vacations";
import { usePermissions } from "@/hooks/use-permissions";
import type { PoliceOfficerVacationItem, PoliceOfficerVacationPeriodItem } from "@/types/police-officer-vacation.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerVacationPeriodsDialog } from "@/components/police-officer-vacations/periods-dialog";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "ongoing":
      return "warning";
    case "interrupted":
      return "secondary";
    default:
      return "info";
  }
}

interface PoliceOfficerVacationPeriodsSectionProps {
  vacation: PoliceOfficerVacationItem;
}

export function PoliceOfficerVacationPeriodsSection({ vacation }: PoliceOfficerVacationPeriodsSectionProps) {
  const permissions = usePermissions("police-officer-vacation-periods");
  const deleteMutation = useDeletePoliceOfficerVacationPeriodMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PoliceOfficerVacationPeriodItem | null>(null);
  const [periodToDelete, setPeriodToDelete] = useState<PoliceOfficerVacationPeriodItem | null>(null);
  const filters = useMemo(
    () => ({
      police_officer_vacation_id: vacation.id,
      per_page: 100,
    }),
    [vacation.id],
  );
  const periodsQuery = usePoliceOfficerVacationPeriods(filters, permissions.canViewAny || permissions.canView);

  async function handleDelete() {
    if (!periodToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(periodToDelete.id);
    setPeriodToDelete(null);
  }

  if (!permissions.canViewAny && !permissions.canView) {
    return null;
  }

  const periods = periodsQuery.data?.data ?? vacation.periods ?? [];

  return (
    <>
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Periodos de ferias</CardTitle>
            <CardDescription>Planejamento do gozo, incluindo parcelamento, aprovacoes e boletins de inicio/retorno.</CardDescription>
          </div>

          {permissions.canCreate && vacation.can_add_period ? (
            <Button
              onClick={() => {
                setEditingPeriod(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar periodo
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {periodsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : periodsQuery.isError ? (
            <p className="text-sm text-slate-500">Nao foi possivel carregar os periodos de ferias.</p>
          ) : periods.length ? (
            <div className="space-y-3">
              {periods.map((period) => (
                <div key={period.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {period.start_date ?? "-"} ate {period.end_date ?? "-"}
                        </p>
                        <Badge variant={getStatusVariant(period.status?.value)}>{period.status?.label ?? "Sem status"}</Badge>
                      </div>

                      <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span>{period.days ?? 0} dias</span>
                        </div>
                        <div>Boletim de inicio: {period.bulletin_start ?? "Nao informado"}</div>
                        <div>Boletim de retorno: {period.bulletin_return ?? "Nao informado"}</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {permissions.canUpdate ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingPeriod(period);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setPeriodToDelete(period)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum periodo cadastrado para este registro de ferias.</p>
          )}
        </CardContent>
      </Card>

      <PoliceOfficerVacationPeriodsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        policeOfficerVacationId={vacation.id}
        period={editingPeriod}
      />

      <Dialog open={Boolean(periodToDelete)} onOpenChange={(open) => !open && setPeriodToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir periodo de ferias</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o periodo de {periodToDelete?.start_date} ate {periodToDelete?.end_date}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPeriodToDelete(null)}>
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
