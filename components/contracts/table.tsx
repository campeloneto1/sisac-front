"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteContractMutation } from "@/hooks/use-contract-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractItem } from "@/types/contract.type";
import { getContractStatusBadgeVariant, getContractStatusLabel } from "@/types/contract.type";
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

function formatCurrency(value?: string | number | null) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatRoleLabel(role: ContractItem["current_manager_role"] | ContractItem["current_inspector_role"]) {
  if (!role?.police_officer) {
    return "Nao definido";
  }

  const warName = role.police_officer.war_name ?? role.police_officer.user?.name ?? "Policial";
  const registration = role.police_officer.registration_number;

  return registration ? `${warName} • ${registration}` : warName;
}

interface ContractsTableProps {
  contracts: ContractItem[];
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const permissions = usePermissions("contracts");
  const deleteMutation = useDeleteContractMutation();
  const [contractToDelete, setContractToDelete] = useState<ContractItem | null>(null);

  async function handleDelete() {
    if (!contractToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(contractToDelete.id);
    setContractToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Contrato</th>
                <th className="px-4 py-3 font-medium">Empresa e tipo</th>
                <th className="px-4 py-3 font-medium">Vigencia</th>
                <th className="px-4 py-3 font-medium">Execucao</th>
                <th className="px-4 py-3 font-medium">Responsaveis</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{contract.contract_number}</p>
                        <Badge variant={getContractStatusBadgeVariant(contract.status)}>
                          {contract.status_label ?? getContractStatusLabel(contract.status)}
                        </Badge>
                        {!contract.is_active ? <Badge variant="outline">Inativo</Badge> : null}
                      </div>
                      <p className="mt-1 text-slate-500">SACC: {contract.sacc_number}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{contract.company?.name ?? `Empresa #${contract.company_id}`}</p>
                      <p>Tipo: {contract.contract_type?.name ?? "Nao informado"}</p>
                      <p>Objeto: {contract.contract_object?.name ?? "Nao informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div className="space-y-1">
                      <p>Inicio: {contract.start_date ? new Date(`${contract.start_date}T00:00:00`).toLocaleDateString("pt-BR") : "-"}</p>
                      <p>Fim: {contract.end_date ? new Date(`${contract.end_date}T00:00:00`).toLocaleDateString("pt-BR") : "-"}</p>
                      <p>Valor: {formatCurrency(contract.total_value)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div className="space-y-1">
                      <p>Executado: {formatCurrency(contract.executed_amount)}</p>
                      <p>Restante: {formatCurrency(contract.remaining_amount)}</p>
                      <p>{contract.executed_percentage ?? 0}% do total</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div className="space-y-1">
                      <p>Gestor: {formatRoleLabel(contract.current_manager_role)}</p>
                      <p>Fiscal: {formatRoleLabel(contract.current_inspector_role)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contracts/${contract.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contracts/${contract.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setContractToDelete(contract)}>
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

      <Dialog open={Boolean(contractToDelete)} onOpenChange={(open) => !open && setContractToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir contrato</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o contrato {contractToDelete?.contract_number}? Como esse modulo possui alertas, transacoes,
              papeis, aditivos e prorrogacoes associados, a API pode restringir a remocao conforme o estado atual do registro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setContractToDelete(null)}>
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
