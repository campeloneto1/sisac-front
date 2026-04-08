"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteVariantMutation } from "@/hooks/use-variant-mutations";
import type { VariantItem } from "@/types/variant.type";
import { getBrandTypeLabel } from "@/types/brand.type";
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

interface VariantsTableProps {
  variants: VariantItem[];
}

function typeVariant(type: string | null | undefined) {
  switch (type) {
    case "weapon":
      return "warning";
    case "logistics":
      return "info";
    case "transport":
      return "success";
    default:
      return "outline";
  }
}

export function VariantsTable({ variants }: VariantsTableProps) {
  const permissions = usePermissions("variants");
  const deleteMutation = useDeleteVariantMutation();
  const [variantToDelete, setVariantToDelete] = useState<VariantItem | null>(null);

  async function handleDelete() {
    if (!variantToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(variantToDelete.id);
    setVariantToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Variante</th>
                <th className="px-4 py-3 font-medium">Sigla</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Tipo da marca</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{variant.name}</p>
                      <p className="mt-1 text-slate-500">Modelo usado pelos catalogos administrativos.</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{variant.abbreviation ?? "-"}</td>
                  <td className="px-4 py-4 text-slate-600">{variant.brand?.name ?? "Sem marca vinculada"}</td>
                  <td className="px-4 py-4">
                    <Badge variant={typeVariant(variant.brand?.type)}>{getBrandTypeLabel(variant.brand?.type)}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/variants/${variant.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/variants/${variant.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setVariantToDelete(variant)}>
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

      <Dialog open={Boolean(variantToDelete)} onOpenChange={(open) => !open && setVariantToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir variante</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {variantToDelete?.name}? Essa ação remove o cadastro da variante do
              catalogo administrativo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVariantToDelete(null)}>
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
