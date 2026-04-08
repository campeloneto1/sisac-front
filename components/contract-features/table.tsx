"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteContractFeatureMutation } from "@/hooks/use-contract-feature-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractFeatureItem } from "@/types/contract-feature.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContractFeaturesTableProps {
  contractFeatures: ContractFeatureItem[];
}

export function ContractFeaturesTable({ contractFeatures }: ContractFeaturesTableProps) {
  const permissions = usePermissions("contract-features");
  const deleteMutation = useDeleteContractFeatureMutation();
  const [contractFeatureToDelete, setContractFeatureToDelete] = useState<ContractFeatureItem | null>(null);

  async function handleDelete() {
    if (!contractFeatureToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(contractFeatureToDelete.id);
    setContractFeatureToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Característica</th>
                <th className="px-4 py-3 font-medium">Uso</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contractFeatures.map((contractFeature) => (
                <tr key={contractFeature.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{contractFeature.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo global de características que podem ser vinculadas a tipos de contrato.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    A API atual não retorna contagem de tipos vinculados, mas esta característica pode estar em uso por `contract-types`.
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contract-features/${contractFeature.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contract-features/${contractFeature.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setContractFeatureToDelete(contractFeature)}>
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

      <Dialog open={Boolean(contractFeatureToDelete)} onOpenChange={(open) => !open && setContractFeatureToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir característica</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {contractFeatureToDelete?.name}? Esta característica pode estar vinculada a tipos de contrato,
              e a API pode bloquear a remoção conforme o uso existente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setContractFeatureToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
