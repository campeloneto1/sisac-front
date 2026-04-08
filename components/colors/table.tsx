"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteColorMutation } from "@/hooks/use-color-mutations";
import type { ColorItem } from "@/types/color.type";
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

interface ColorsTableProps {
  colors: ColorItem[];
}

function getColorPreviewStyle(hex?: string | null) {
  return {
    backgroundColor: hex && /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#e2e8f0",
  };
}

export function ColorsTable({ colors }: ColorsTableProps) {
  const permissions = usePermissions("colors");
  const deleteMutation = useDeleteColorMutation();
  const [colorToDelete, setColorToDelete] = useState<ColorItem | null>(null);

  async function handleDelete() {
    if (!colorToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(colorToDelete.id);
    setColorToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Cor</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">HEX</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((color) => (
                <tr key={color.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-2xl border border-slate-200 shadow-sm"
                        style={getColorPreviewStyle(color.hex)}
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {color.name}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Cadastro mestre de cores para módulos administrativos.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{color.slug}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {color.hex ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={color.is_active ? "success" : "danger"}>
                      {color.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/colors/${color.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/colors/${color.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setColorToDelete(color)}
                        >
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

      <Dialog
        open={Boolean(colorToDelete)}
        onOpenChange={(open) => !open && setColorToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cor</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {colorToDelete?.name}? Essa ação
              não podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setColorToDelete(null)}>
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
