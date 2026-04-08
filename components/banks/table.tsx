"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteBankMutation } from "@/hooks/use-bank-mutations";
import type { BankItem } from "@/types/bank.type";
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

interface BanksTableProps {
  banks: BankItem[];
}

export function BanksTable({ banks }: BanksTableProps) {
  const permissions = usePermissions("banks");
  const deleteMutation = useDeleteBankMutation();
  const [bankToDelete, setBankToDelete] = useState<BankItem | null>(null);

  async function handleDelete() {
    if (!bankToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(bankToDelete.id);
    setBankToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Banco</th>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((bank) => (
                <tr key={bank.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{bank.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo global de bancos utilizados por outros módulos.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{bank.code}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/banks/${bank.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/banks/${bank.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setBankToDelete(bank)}>
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

      <Dialog open={Boolean(bankToDelete)} onOpenChange={(open) => !open && setBankToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir banco</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {bankToDelete?.name}? Se houver policiais vinculados a este banco, a API pode bloquear a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBankToDelete(null)}>
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
