"use client";

import Link from "next/link";
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteMaterialLoanMutation } from "@/hooks/use-material-loan-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { MaterialLoanRecord } from "@/types/material-loan.type";
import {
  getMaterialLoanKindVariant,
  getMaterialLoanStatusVariant,
} from "@/types/material-loan.type";
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

interface MaterialLoansTableProps {
  loans: MaterialLoanRecord[];
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDivergenceLabel(loan: MaterialLoanRecord) {
  const totals = (loan.items ?? []).reduce(
    (accumulator, item) => {
      accumulator.consumed += item.consumed_quantity;
      accumulator.lost += item.lost_quantity;
      return accumulator;
    },
    { consumed: 0, lost: 0 },
  );

  if (totals.consumed || totals.lost) {
    return `Consumo ${totals.consumed} • Extravio ${totals.lost}`;
  }

  return "Sem divergencia registrada";
}

export function MaterialLoansTable({ loans }: MaterialLoansTableProps) {
  const permissions = usePermissions("material-loans");
  const deleteMutation = useDeleteMaterialLoanMutation();
  const [loanToDelete, setLoanToDelete] = useState<MaterialLoanRecord | null>(
    null,
  );

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">Tipo e status</th>
                <th className="px-4 py-3 font-medium">Movimentacao</th>
                <th className="px-4 py-3 font-medium">Quantitativo</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => {
                const canManageReturn =
                  permissions.canUpdate && loan.status !== "returned";
                const canDelete =
                  permissions.canDelete && loan.status === "returned";

                return (
                  <tr key={loan.id} className="border-t border-slate-200/70">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {loan.police_officer?.war_name ||
                          loan.police_officer?.name ||
                          `Policial #${loan.police_officer_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {loan.police_officer?.registration_number ||
                          "Matrícula não informada"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getMaterialLoanKindVariant(loan.kind)}>
                          {loan.kind_label ?? loan.kind}
                        </Badge>
                        <Badge variant={getMaterialLoanStatusVariant(loan.status)}>
                          {loan.status_label ?? loan.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-slate-500">
                        {getDivergenceLabel(loan)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p>Emprestado em {formatDateTime(loan.loaned_at)}</p>
                      <p className="mt-1">
                        Previsto para{" "}
                        {loan.expected_return_at
                          ? formatDateTime(loan.expected_return_at)
                          : "não informado"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p>Total: {loan.total_quantity}</p>
                      <p className="mt-1">
                        Devolvido: {loan.returned_quantity} • Pendente:{" "}
                        {loan.pending_quantity}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {permissions.canView ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/material-loans/${loan.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Visualizar</span>
                            </Link>
                          </Button>
                        ) : null}

                        {permissions.canUpdate && loan.status !== "returned" ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/material-loans/${loan.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                        ) : null}

                        {canManageReturn ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/material-loans/${loan.id}/return`}>
                              <RotateCcw className="h-4 w-4" />
                              <span className="sr-only">Registrar devolução</span>
                            </Link>
                          </Button>
                        ) : null}

                        {canDelete ? (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setLoanToDelete(loan)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(loanToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setLoanToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir empréstimo de material</DialogTitle>
            <DialogDescription>
              Essa ação removera o empréstimo
              {loanToDelete
                ? ` do policial ${
                    loanToDelete.police_officer?.war_name ||
                    loanToDelete.police_officer?.name ||
                    `#${loanToDelete.police_officer_id}`
                  }`
                : ""}
              . O backend so permite excluir empréstimos já devolvidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLoanToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !loanToDelete}
              onClick={async () => {
                if (!loanToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(loanToDelete.id);
                setLoanToDelete(null);
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
