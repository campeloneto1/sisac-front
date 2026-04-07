"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteContractObjectMutation } from "@/hooks/use-contract-object-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractObjectItem } from "@/types/contract-object.type";
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

interface ContractObjectsTableProps {
  contractObjects: ContractObjectItem[];
}

function getDescriptionPreview(description?: string | null) {
  if (!description?.trim()) {
    return "Sem descricao cadastrada.";
  }

  return description.length > 120 ? `${description.slice(0, 120)}...` : description;
}

export function ContractObjectsTable({ contractObjects }: ContractObjectsTableProps) {
  const permissions = usePermissions("contract-objects");
  const deleteMutation = useDeleteContractObjectMutation();
  const [contractObjectToDelete, setContractObjectToDelete] = useState<ContractObjectItem | null>(null);

  async function handleDelete() {
    if (!contractObjectToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(contractObjectToDelete.id);
    setContractObjectToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Objeto</th>
                <th className="px-4 py-3 font-medium">Descricao</th>
                <th className="px-4 py-3 font-medium">Contratos</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {contractObjects.map((contractObject) => (
                <tr key={contractObject.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{contractObject.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo global para definir o objeto de contratos.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{getDescriptionPreview(contractObject.description)}</td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{contractObject.contracts_count ?? 0} contrato(s)</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contract-objects/${contractObject.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/contract-objects/${contractObject.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setContractObjectToDelete(contractObject)}>
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

      <Dialog open={Boolean(contractObjectToDelete)} onOpenChange={(open) => !open && setContractObjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir objeto de contrato</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {contractObjectToDelete?.name}? Como a API usa exclusao logica, o registro pode deixar de aparecer,
              mas contratos existentes ainda podem referenciar esse objeto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setContractObjectToDelete(null)}>
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
