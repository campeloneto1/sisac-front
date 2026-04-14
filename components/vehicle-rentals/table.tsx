"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteVehicleRentalMutation } from "@/hooks/use-vehicle-rental-mutations";
import { formatBrazilianDate } from "@/lib/date-formatter";
import {
  getVehicleRentalStatusVariant,
  type VehicleRentalItem,
} from "@/types/vehicle-rental.type";
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

interface VehicleRentalsTableProps {
  rentals: VehicleRentalItem[];
}

function formatDate(date?: string | null) {
  return formatBrazilianDate(date);
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

export function VehicleRentalsTable({ rentals }: VehicleRentalsTableProps) {
  const permissions = usePermissions("vehicle-rentals");
  const deleteMutation = useDeleteVehicleRentalMutation();
  const [rentalToDelete, setRentalToDelete] = useState<VehicleRentalItem | null>(
    null,
  );

  async function handleDelete() {
    if (!rentalToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(rentalToDelete.id);
    setRentalToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Locadora</th>
                <th className="px-4 py-3 font-medium">Contrato</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Custos</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {rental.vehicle?.license_plate ?? `#${rental.vehicle_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">
                        KM entrada: {rental.entry_km ?? "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {rental.company?.trade_name || rental.company?.name || "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {rental.contract_number ?? "Sem número"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{formatDate(rental.contract_start_date)}</p>
                    <p>{formatDate(rental.contract_end_date)}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>Diario: {formatCurrency(rental.daily_cost)}</p>
                    <p>Mensal: {formatCurrency(rental.monthly_cost)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getVehicleRentalStatusVariant(rental.status)}>
                      {rental.status_label ?? "Sem status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-rentals/${rental.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-rentals/${rental.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setRentalToDelete(rental)}
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
        open={Boolean(rentalToDelete)}
        onOpenChange={(open) => !open && setRentalToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir locação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a locação do veículo{" "}
              {rentalToDelete?.vehicle?.license_plate ??
                `#${rentalToDelete?.vehicle_id}`}
              ? Essa ação não podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRentalToDelete(null)}
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
