"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteVehicleMaintenanceMutation } from "@/hooks/use-vehicle-maintenance-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { formatBrazilianDate } from "@/lib/date-formatter";
import type { VehicleMaintenanceItem } from "@/types/vehicle-maintenance.type";
import { getVehicleMaintenanceStatusVariant } from "@/types/vehicle-maintenance.type";
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

interface VehicleMaintenancesTableProps {
  maintenances: VehicleMaintenanceItem[];
}

function formatDate(date?: string | null) {
  return formatBrazilianDate(date);
}

export function VehicleMaintenancesTable({
  maintenances,
}: VehicleMaintenancesTableProps) {
  const permissions = usePermissions("vehicle-maintenances");
  const deleteMutation = useDeleteVehicleMaintenanceMutation();
  const [maintenanceToDelete, setMaintenanceToDelete] =
    useState<VehicleMaintenanceItem | null>(null);

  async function handleDelete() {
    if (!maintenanceToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(maintenanceToDelete.id);
    setMaintenanceToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Oficina</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Entrada</th>
                <th className="px-4 py-3 font-medium">Saida</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((maintenance) => (
                <tr
                  key={maintenance.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {maintenance.vehicle?.license_plate ??
                          `#${maintenance.vehicle_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {maintenance.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {maintenance.workshop?.name ?? "Não informada"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {maintenance.maintenance_type_label ?? "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{formatDate(maintenance.entry_date)}</p>
                    <p>{maintenance.entry_time ?? "-"}</p>
                    <p>{maintenance.entry_km} km</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{formatDate(maintenance.exit_date)}</p>
                    <p>{maintenance.exit_time ?? "-"}</p>
                    <p>
                      {maintenance.exit_km !== null &&
                      maintenance.exit_km !== undefined
                        ? `${maintenance.exit_km} km`
                        : "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={getVehicleMaintenanceStatusVariant(
                        maintenance.status,
                      )}
                    >
                      {maintenance.status_label ?? "Sem status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-maintenances/${maintenance.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/vehicle-maintenances/${maintenance.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setMaintenanceToDelete(maintenance)}
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
        open={Boolean(maintenanceToDelete)}
        onOpenChange={(open) => !open && setMaintenanceToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir manutenção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a manutenção do veículo{" "}
              {maintenanceToDelete?.vehicle?.license_plate ??
                `#${maintenanceToDelete?.vehicle_id}`}
              ? Essa ação não podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMaintenanceToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending
                ? "Excluindo..."
                : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
