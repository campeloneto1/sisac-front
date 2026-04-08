"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2, Wrench } from "lucide-react";

import { useDeleteWorkshopMutation } from "@/hooks/use-workshop-mutations";
import { usePermissions } from "@/hooks/use-permissions";
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

function getStatusVariant(workshop: WorkshopItem) {
  return workshop.status === "active" ? "success" : "secondary";
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
                <th className="px-4 py-3 font-medium">Localização</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Especialidades</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {workshops.map((workshop) => (
                <tr key={workshop.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary shadow-sm">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {workshop.name}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {workshop.cnpj ?? workshop.email ?? "Sem identificador complementar"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {[workshop.city, workshop.state].filter(Boolean).join(" / ") ||
                      workshop.address ||
                      "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {workshop.contact_person || workshop.phone || workshop.contact_phone || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(workshop.specialties ?? []).slice(0, 3).map((specialty) => (
                        <Badge key={`${workshop.id}-${specialty}`} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                      {(workshop.specialties?.length ?? 0) > 3 ? (
                        <Badge variant="secondary">
                          +{(workshop.specialties?.length ?? 0) - 3}
                        </Badge>
                      ) : null}
                      {!workshop.specialties?.length ? (
                        <span className="text-slate-500">-</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusVariant(workshop)}>
                      {workshop.status_label ?? (workshop.is_active ? "Ativa" : "Inativa")}
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
              Tem certeza que deseja excluir {workshopToDelete?.name}? Essa ação
              não podera ser desfeita.
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
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
