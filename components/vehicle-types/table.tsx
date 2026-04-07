"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteVehicleTypeMutation } from "@/hooks/use-vehicle-type-mutations";
import type { VehicleTypeItem } from "@/types/vehicle-type.type";
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

interface VehicleTypesTableProps {
  vehicleTypes: VehicleTypeItem[];
}

export function VehicleTypesTable({
  vehicleTypes,
}: VehicleTypesTableProps) {
  const permissions = usePermissions("vehicle-types");
  const deleteMutation = useDeleteVehicleTypeMutation();
  const [vehicleTypeToDelete, setVehicleTypeToDelete] =
    useState<VehicleTypeItem | null>(null);

  async function handleDelete() {
    if (!vehicleTypeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(vehicleTypeToDelete.id);
    setVehicleTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Veiculos</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {vehicleTypes.map((vehicleType) => (
                <tr
                  key={vehicleType.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {vehicleType.name}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Cadastro mestre para classificacao de veiculos.
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {vehicleType.slug}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {vehicleType.code ?? "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {vehicleType.vehicles_count ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={vehicleType.is_active ? "success" : "danger"}
                    >
                      {vehicleType.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-types/${vehicleType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-types/${vehicleType.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setVehicleTypeToDelete(vehicleType)}
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
        open={Boolean(vehicleTypeToDelete)}
        onOpenChange={(open) => !open && setVehicleTypeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de veiculo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {vehicleTypeToDelete?.name}? Essa
              acao nao podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setVehicleTypeToDelete(null)}
            >
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
