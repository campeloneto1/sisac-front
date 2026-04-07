"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteContractTypeMutation } from "@/hooks/use-contract-type-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractTypeItem } from "@/types/contract-type.type";
import { getContractBillingModelDescription, getContractBillingModelLabel } from "@/types/contract-type.type";
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

interface ContractTypesTableProps {
  contractTypes: ContractTypeItem[];
}

export function ContractTypesTable({ contractTypes }: ContractTypesTableProps) {
  const permissions = usePermissions("contract-types");
  const deleteMutation = useDeleteContractTypeMutation();
  const [contractTypeToDelete, setContractTypeToDelete] = useState<ContractTypeItem | null>(null);

  async function handleDelete() {
    if (!contractTypeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(contractTypeToDelete.id);
    setContractTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo de contrato</th>
                <th className="px-4 py-3 font-medium">Faturamento</th>
                <th className="px-4 py-3 font-medium">Features</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {contractTypes.map((contractType) => (
                <tr key={contractType.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{contractType.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo global para classificacao e regra base de contratos.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <Badge variant="info">{contractType.billing_model_label ?? getContractBillingModelLabel(contractType.billing_model)}</Badge>
                      <p className="mt-2 text-xs text-slate-500">
                        {contractType.billing_model_description ?? getContractBillingModelDescription(contractType.billing_model)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p className="font-medium text-slate-900">{contractType.features?.length ?? 0} vinculada(s)</p>
                      <p className="mt-1 text-slate-500">
                        {contractType.features?.length
                          ? contractType.features.slice(0, 3).map((feature) => feature.name).join(", ")
                          : "Sem features associadas"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contract-types/${contractType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contract-types/${contractType.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setContractTypeToDelete(contractType)}>
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

      <Dialog open={Boolean(contractTypeToDelete)} onOpenChange={(open) => !open && setContractTypeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de contrato</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {contractTypeToDelete?.name}? Como a API usa exclusao logica, o registro pode deixar de aparecer,
              mas contratos existentes ainda podem referenciar esse tipo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setContractTypeToDelete(null)}>
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
