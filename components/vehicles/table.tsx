"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteVehicleMutation } from "@/hooks/use-vehicle-mutations";
import type { VehicleItem } from "@/types/vehicle.type";
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

interface VehiclesTableProps {
  vehicles: VehicleItem[];
}

function getOperationalStatusVariant(status?: string | null) {
  switch (status) {
    case "available":
      return "success";
    case "in_use":
      return "info";
    case "maintenance":
      return "warning";
    case "custody":
      return "secondary";
    case "decommissioned":
      return "danger";
    default:
      return "outline";
  }
}

export function VehiclesTable({ vehicles }: VehiclesTableProps) {
  const permissions = usePermissions("vehicles");
  const deleteMutation = useDeleteVehicleMutation();
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(
    null,
  );

  async function handleDelete() {
    if (!vehicleToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(vehicleToDelete.id);
    setVehicleToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Classificação</th>
                <th className="px-4 py-3 font-medium">Subunidade</th>
                <th className="px-4 py-3 font-medium">KM</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {vehicle.license_plate}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {vehicle.special_plate
                          ? `Placa especial: ${vehicle.special_plate}`
                          : vehicle.chassis
                            ? `Chassi: ${vehicle.chassis}`
                            : "Sem identificador adicional"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>
                        {vehicle.vehicle_type?.name ?? "Tipo não informado"}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {vehicle.variant?.brand?.name
                          ? `${vehicle.variant.brand.name} • `
                          : ""}
                        {vehicle.variant?.name ?? "Modelo não informado"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {vehicle.subunit?.abbreviation ??
                      vehicle.subunit?.name ??
                      "Não informada"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>Atual: {vehicle.current_km.toLocaleString("pt-BR")}</p>
                      <p className="mt-1 text-slate-500">
                        Inicial: {vehicle.initial_km.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={getOperationalStatusVariant(
                          vehicle.operational_status,
                        )}
                      >
                        {vehicle.operational_status_label ?? "Sem status"}
                      </Badge>
                      <Badge variant={vehicle.is_available ? "success" : "warning"}>
                        {vehicle.is_available ? "Disponível" : "Indisponivel"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicles/${vehicle.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setVehicleToDelete(vehicle)}
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
        open={Boolean(vehicleToDelete)}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir veículo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o veículo{" "}
              {vehicleToDelete?.license_plate}? Essa ação faz soft delete no
              backend.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVehicleToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
