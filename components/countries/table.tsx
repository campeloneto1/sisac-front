"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteCountryMutation } from "@/hooks/use-country-mutations";
import type { CountryItem } from "@/types/country.type";
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

interface CountriesTableProps {
  countries: CountryItem[];
}

export function CountriesTable({ countries }: CountriesTableProps) {
  const permissions = usePermissions("countries");
  const deleteMutation = useDeleteCountryMutation();
  const [countryToDelete, setCountryToDelete] = useState<CountryItem | null>(null);

  async function handleDelete() {
    if (!countryToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(countryToDelete.id);
    setCountryToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">País</th>
                <th className="px-4 py-3 font-medium">Sigla</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((country) => (
                <tr key={country.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{country.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo global de países.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{country.abbreviation}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/countries/${country.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/countries/${country.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setCountryToDelete(country)}>
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

      <Dialog open={Boolean(countryToDelete)} onOpenChange={(open) => !open && setCountryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir país</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {countryToDelete?.name}? Essa ação remove o país do cadastro administrativo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCountryToDelete(null)}>
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
