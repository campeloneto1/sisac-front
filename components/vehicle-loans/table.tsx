"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteVehicleLoanMutation } from "@/hooks/use-vehicle-loan-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { formatBrazilianDate } from "@/lib/date-formatter";
import type { VehicleLoanItem } from "@/types/vehicle-loan.type";
import {
  getVehicleLoanBorrowerLabel,
  getVehicleLoanStatusVariant,
} from "@/types/vehicle-loan.type";
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

interface VehicleLoansTableProps {
  loans: VehicleLoanItem[];
}

function formatDateTime(date?: string | null, time?: string | null) {
  if (!date) {
    return "-";
  }

  return `${formatBrazilianDate(date)}${time ? ` • ${time.slice(0, 5)}` : ""}`;
}

export function VehicleLoansTable({ loans }: VehicleLoansTableProps) {
  const permissions = usePermissions("vehicle-loans");
  const deleteMutation = useDeleteVehicleLoanMutation();
  const [loanToDelete, setLoanToDelete] = useState<VehicleLoanItem | null>(
    null,
  );

  async function handleDelete() {
    if (!loanToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(loanToDelete.id);
    setLoanToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Veículo</th>
                <th className="px-4 py-3 font-medium">Tomador</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">KM</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {loan.vehicle?.license_plate ?? `#${loan.vehicle_id}`}
                        {loan.vehicle?.special_plate
                          ? ` • ${loan.vehicle.special_plate}`
                          : ""}
                      </p>

                      <p className="mt-1 text-slate-500">
                        {loan.vehicle?.variant?.brand?.name
                          ? `${loan.vehicle.variant.brand.name}`
                          : ""}
                        {loan.vehicle?.variant?.name
                          ? ` • ${loan.vehicle.variant.name}`
                          : ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {getVehicleLoanBorrowerLabel(loan)}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {loan.borrower_type === "App\\Models\\PoliceOfficer"
                          ? "Policial"
                          : loan.borrower_type === "App\\Models\\User"
                            ? "Usuário"
                            : "Externo"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>
                      Saida: {formatDateTime(loan.start_date, loan.start_time)}
                    </p>
                    <p>
                      Retorno: {formatDateTime(loan.end_date, loan.end_time)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>Início: {loan.start_km.toLocaleString("pt-BR")}</p>
                    <p>
                      Final:{" "}
                      {loan.end_km !== null && loan.end_km !== undefined
                        ? loan.end_km.toLocaleString("pt-BR")
                        : "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getVehicleLoanStatusVariant(loan.status)}>
                      {loan.status_label ?? "Sem status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-loans/${loan.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/vehicle-loans/${loan.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setLoanToDelete(loan)}
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
        open={Boolean(loanToDelete)}
        onOpenChange={(open) => !open && setLoanToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir empréstimo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o empréstimo do veículo{" "}
              {loanToDelete?.vehicle?.license_plate ??
                `#${loanToDelete?.vehicle_id}`}
              ? Essa ação não podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLoanToDelete(null)}>
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
