"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeleteNotificationResponsibilityMutation } from "@/hooks/use-notification-responsibility-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { NotificationResponsibilityItem } from "@/types/notification-responsibility.type";
import { getDomainLabel, getDomainValue } from "@/types/notification-responsibility.type";
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

interface NotificationResponsibilitiesTableProps {
  items: NotificationResponsibilityItem[];
}

export function NotificationResponsibilitiesTable({ items }: NotificationResponsibilitiesTableProps) {
  const permissions = usePermissions("notification-responsibilities");
  const deleteMutation = useDeleteNotificationResponsibilityMutation();
  const [itemToDelete, setItemToDelete] = useState<NotificationResponsibilityItem | null>(null);

  async function handleDelete() {
    if (!itemToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(itemToDelete.id);
    setItemToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dominio</th>
                <th className="px-4 py-3 font-medium">Subunidade</th>
                <th className="px-4 py-3 font-medium">Setor responsável</th>
                <th className="px-4 py-3 font-medium">Auditoria</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <Badge variant="info">{getDomainLabel(item.domain)}</Badge>
                      <p className="text-xs text-slate-500">{getDomainValue(item.domain)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p className="font-medium text-slate-900">{item.subunit?.name ?? `Subunidade #${item.subunit_id}`}</p>
                      <p className="mt-1 text-slate-500">{item.subunit?.abbreviation ?? "Sem sigla"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p className="font-medium text-slate-900">{item.sector?.name ?? `Setor #${item.sector_id}`}</p>
                      <p className="mt-1 text-slate-500">{item.sector?.abbreviation ?? "Sem sigla"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-1">
                      <p>Atualizado por: {item.updater ? item.updater.name : "Não informado"}</p>
                      <p>Em: {item.updated_at ? new Date(item.updated_at).toLocaleString("pt-BR") : "Não informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/notification-responsibilities/${item.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/notification-responsibilities/${item.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setItemToDelete(item)}>
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

      <Dialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir responsabilidade de notificação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover a regra de {itemToDelete ? getDomainLabel(itemToDelete.domain) : ""}?
              Isso pode impedir o envio automático de notificações para a subunidade configurada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
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
