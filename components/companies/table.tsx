"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteCompanyMutation } from "@/hooks/use-company-mutations";
import type { CompanyItem } from "@/types/company.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompaniesTableProps {
  companies: CompanyItem[];
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  const permissions = usePermissions("companies");
  const deleteMutation = useDeleteCompanyMutation();
  const [companyToDelete, setCompanyToDelete] = useState<CompanyItem | null>(null);

  async function handleDelete() {
    if (!companyToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(companyToDelete.id);
    setCompanyToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">CNPJ</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Subunidade</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{company.name}</p>
                      {company.trade_name ? <p className="mt-1 text-slate-500">{company.trade_name}</p> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-700">{company.cnpj ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-700">{company.city?.name ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-700">{company.subunit?.name ?? "-"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/companies/${company.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/companies/${company.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setCompanyToDelete(company)}>
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

      <Dialog open={Boolean(companyToDelete)} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir empresa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {companyToDelete?.name}? Se houver registros vinculados, a API pode bloquear a exclusao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCompanyToDelete(null)}>
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
