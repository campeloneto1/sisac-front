"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteWorkshopMutation } from "@/hooks/use-workshop-mutations";
import type { WorkshopItem } from "@/types/workshop.type";
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

interface WorkshopsTableProps {
  workshops: WorkshopItem[];
}

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "secondary";
    default:
      return "outline";
  }
}

export function WorkshopsTable({ workshops }: WorkshopsTableProps) {
  const permissions = usePermissions("workshops");
  const deleteMutation = useDeleteWorkshopMutation();
  const [workshopToDelete, setWorkshopToDelete] = useState<WorkshopItem | null>(
    null,
  );

  async function handleDelete() {
    if (!workshopToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(workshopToDelete.id);
    setWorkshopToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Oficina</th>
                <th className="px-4 py-3 font-medium">Localizacao</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Especialidades</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map((workshop) => (
                <tr key={workshop.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {workshop.name}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {workshop.cnpj ?? "CNPJ nao informado"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {workshop.city || workshop.state
                      ? `${workshop.city ?? "Cidade nao informada"}${
                          workshop.state ? ` • ${workshop.state}` : ""
                        }`
                      : "Nao informada"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{workshop.phone ?? "Sem telefone"}</p>
                      <p className="mt-1 text-slate-500">
                        {workshop.email ?? "Sem email"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {workshop.specialties?.length
                      ? workshop.specialties.slice(0, 2).join(", ")
                      : "Nao informadas"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusVariant(workshop.status)}>
                      {workshop.status_label ?? "Sem status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/workshops/${workshop.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/workshops/${workshop.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setWorkshopToDelete(workshop)}
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
        open={Boolean(workshopToDelete)}
        onOpenChange={(open) => !open && setWorkshopToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir oficina</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {workshopToDelete?.name}? Essa acao
              nao podera ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setWorkshopToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
