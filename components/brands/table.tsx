"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteBrandMutation } from "@/hooks/use-brand-mutations";
import { type BrandItem } from "@/types/brand.type";
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

interface BrandsTableProps {
  brands: BrandItem[];
}

function typeVariant(type: string) {
  switch (type) {
    case "armament":
      return "warning";
    case "material":
      return "info";
    case "vehicle":
      return "success";
    default:
      return "outline";
  }
}

export function BrandsTable({ brands }: BrandsTableProps) {
  const permissions = usePermissions("brands");
  const deleteMutation = useDeleteBrandMutation();
  const [brandToDelete, setBrandToDelete] = useState<BrandItem | null>(null);

  async function handleDelete() {
    if (!brandToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(brandToDelete.id);
    setBrandToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Sigla</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Modelos</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => {
                const canDeleteBrand =
                  permissions.canDelete && !brand.variants_count;

                return (
                  <tr key={brand.id} className="border-t border-slate-200/70">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {brand.name}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Cadastro mestre para catalogos dependentes.
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {brand.abbreviation ?? "-"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={typeVariant(brand.type.value)}>
                        {brand.type.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {brand.variants_count ?? 0}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {permissions.canView ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/brands/${brand.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {permissions.canUpdate ? (
                          <Button asChild size="icon" variant="outline">
                            <Link href={`/brands/${brand.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}

                        {canDeleteBrand ? (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setBrandToDelete(brand)}
                          >
                            <Trash2 className="h-4 w-4" />
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
        open={Boolean(brandToDelete)}
        onOpenChange={(open) => !open && setBrandToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir marca</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {brandToDelete?.name}? Marcas com
              modelos vinculados não podem ser removidas pela policy.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBrandToDelete(null)}>
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
