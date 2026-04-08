"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteVehicleFuelingMutation } from "@/hooks/use-vehicle-fueling-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { VehicleFuelingItem } from "@/types/vehicle-fueling.type";
import {
  getVehicleFuelingContextLabel,
  getVehicleFuelTypeVariant,
} from "@/types/vehicle-fueling.type";
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

interface VehicleFuelingsTableProps {
  fuelings: VehicleFuelingItem[];
}

function formatDate(date?: string | null) {
  return date ? date.slice(0, 10) : "-";
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function VehicleFuelingsTable({
  fuelings,
}: VehicleFuelingsTableProps) {
  const permissions = usePermissions("vehicle-fuelings");
  const deleteMutation = useDeleteVehicleFuelingMutation();
  const [fuelingToDelete, setFuelingToDelete] =
    useState<VehicleFuelingItem | null>(null);

  async function handleDelete() {
    if (!fuelingToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(fuelingToDelete.id);
    setFuelingToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Contexto</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Combustivel</th>
                <th className="px-4 py-3 font-medium">Litros / custo</th>
                <th className="px-4 py-3 font-medium">Posto</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fuelings.map((fueling) => (
                <tr key={fueling.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {fueling.vehicle?.license_plate ?? `#${fueling.vehicle_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">{fueling.km} km</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-1">
                      <p>{getVehicleFuelingContextLabel(fueling)}</p>
                      <p className="text-xs text-slate-400">
                        #{fueling.fuelable_id ?? "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{formatDate(fueling.fueling_date)}</p>
                    <p>{fueling.fueling_time ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={getVehicleFuelTypeVariant(fueling.fuel_type)}>
                        {fueling.fuel_type_label ?? fueling.fuel_type}
                      </Badge>
                      {fueling.is_full_tank ? (
                        <Badge variant="secondary">Tanque cheio</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{fueling.liters.toFixed(2)} L</p>
                    <p>{formatCurrency(fueling.total_cost)}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{fueling.gas_station ?? "Não informado"}</p>
                    <p>{fueling.gas_station_city ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-fuelings/${fueling.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-fuelings/${fueling.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setFuelingToDelete(fueling)}
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
        open={Boolean(fuelingToDelete)}
        onOpenChange={(open) => !open && setFuelingToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir abastecimento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o abastecimento do veículo{" "}
              {fuelingToDelete?.vehicle?.license_plate ??
                `#${fuelingToDelete?.vehicle_id}`}
              ? Essa ação não podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFuelingToDelete(null)}
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
