"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteVehicleDamageMutation } from "@/hooks/use-vehicle-damage-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { formatBrazilianDate } from "@/lib/date-formatter";
import type { VehicleDamageItem } from "@/types/vehicle-damage.type";
import {
  getVehicleDamageContextLabel,
  getVehicleDamageSeverityVariant,
  getVehicleDamageStatusVariant,
} from "@/types/vehicle-damage.type";
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

interface VehicleDamagesTableProps {
  damages: VehicleDamageItem[];
}

function formatDate(date?: string | null) {
  return formatBrazilianDate(date);
}

export function VehicleDamagesTable({ damages }: VehicleDamagesTableProps) {
  const permissions = usePermissions("vehicle-damages");
  const deleteMutation = useDeleteVehicleDamageMutation();
  const [damageToDelete, setDamageToDelete] = useState<VehicleDamageItem | null>(
    null,
  );

  async function handleDelete() {
    if (!damageToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(damageToDelete.id);
    setDamageToDelete(null);
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
                <th className="px-4 py-3 font-medium">Tipo e local</th>
                <th className="px-4 py-3 font-medium">Deteccao</th>
                <th className="px-4 py-3 font-medium">Gravidade</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {damages.map((damage) => (
                <tr key={damage.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {damage.vehicle?.license_plate ?? `#${damage.vehicle_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">{damage.location}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-1">
                      <p>{getVehicleDamageContextLabel(damage)}</p>
                      <p className="text-xs text-slate-400">
                        #{damage.damageable_id ?? "-"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{damage.damage_type_label ?? damage.damage_type}</p>
                    <p className="text-slate-500">{damage.description}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>{formatDate(damage.detected_date)}</p>
                    <p>{damage.detection_moment_label ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={getVehicleDamageSeverityVariant(damage.severity)}
                    >
                      {damage.severity_label ?? "Sem gravidade"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getVehicleDamageStatusVariant(damage.status)}>
                      {damage.status_label ?? "Sem status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-damages/${damage.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-damages/${damage.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setDamageToDelete(damage)}
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
        open={Boolean(damageToDelete)}
        onOpenChange={(open) => !open && setDamageToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir dano</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o dano do veículo{" "}
              {damageToDelete?.vehicle?.license_plate ??
                `#${damageToDelete?.vehicle_id}`}
              ? Essa ação não podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDamageToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
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
