"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteCityMutation } from "@/hooks/use-city-mutations";
import type { CityItem } from "@/types/city.type";
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

interface CitiesTableProps {
  cities: CityItem[];
}

export function CitiesTable({ cities }: CitiesTableProps) {
  const permissions = usePermissions("cities");
  const deleteMutation = useDeleteCityMutation();
  const [cityToDelete, setCityToDelete] = useState<CityItem | null>(null);

  async function handleDelete() {
    if (!cityToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(cityToDelete.id);
    setCityToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Sigla</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{city.name}</p>
                      <p className="mt-1 text-slate-500">Cadastro administrativo utilizado em enderecos e entidades vinculadas.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{city.abbreviation || "Sem sigla"}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {city.state ? `${city.state.name} (${city.state.abbreviation})` : "Sem estado vinculado"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/cities/${city.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/cities/${city.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setCityToDelete(city)}>
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

      <Dialog open={Boolean(cityToDelete)} onOpenChange={(open) => !open && setCityToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cidade</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {cityToDelete?.name}? Se existirem empresas vinculadas, a API pode bloquear essa exclusao.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCityToDelete(null)}>
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
