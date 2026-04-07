"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteVehicleCustodyMutation } from "@/hooks/use-vehicle-custody-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { VehicleCustodyItem } from "@/types/vehicle-custody.type";
import {
  getVehicleCustodyCustodianLabel,
  getVehicleCustodyStatusVariant,
} from "@/types/vehicle-custody.type";
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

interface VehicleCustodiesTableProps {
  custodies: VehicleCustodyItem[];
}

function formatDate(date?: string | null) {
  return date ? date.slice(0, 10) : "-";
}

export function VehicleCustodiesTable({
  custodies,
}: VehicleCustodiesTableProps) {
  const permissions = usePermissions("vehicle-custodies");
  const deleteMutation = useDeleteVehicleCustodyMutation();
  const [custodyToDelete, setCustodyToDelete] =
    useState<VehicleCustodyItem | null>(null);

  async function handleDelete() {
    if (!custodyToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(custodyToDelete.id);
    setCustodyToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Veiculo</th>
                <th className="px-4 py-3 font-medium">Custodiante</th>
                <th className="px-4 py-3 font-medium">Periodo</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {custodies.map((custody) => (
                <tr
                  key={custody.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {custody.vehicle?.license_plate ?? `#${custody.vehicle_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {custody.vehicle?.vehicle_type?.name ?? "Tipo nao informado"}
                        {custody.vehicle?.variant?.name
                          ? ` • ${custody.vehicle.variant.name}`
                          : ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {getVehicleCustodyCustodianLabel(custody)}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {custody.custodian_type === "App\\Models\\PoliceOfficer"
                          ? "Policial"
                          : "Usuario"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>Inicio: {formatDate(custody.start_date)}</p>
                    <p>Previsto: {formatDate(custody.end_date)}</p>
                    <p>Efetivo: {formatDate(custody.actual_end_date)}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {custody.document_number ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={getVehicleCustodyStatusVariant(custody.status)}
                    >
                      {custody.status_label ?? "Sem status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-custodies/${custody.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-custodies/${custody.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setCustodyToDelete(custody)}
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
        open={Boolean(custodyToDelete)}
        onOpenChange={(open) => !open && setCustodyToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cautela</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a cautela do veiculo{" "}
              {custodyToDelete?.vehicle?.license_plate ??
                `#${custodyToDelete?.vehicle_id}`}
              ? Essa acao nao podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCustodyToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending
                ? "Excluindo..."
                : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
