"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useDeleteServiceMutation } from "@/hooks/use-service-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { ServiceItem } from "@/types/service.type";
import { getServicePriorityVariant, getServiceStatusVariant } from "@/types/service.type";
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

interface ServicesTableProps {
  services: ServiceItem[];
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ServicesTable({ services }: ServicesTableProps) {
  const permissions = usePermissions("services");
  const deleteMutation = useDeleteServiceMutation();
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Serviço</th>
                <th className="px-4 py-3 font-medium">Status e prioridade</th>
                <th className="px-4 py-3 font-medium">Solicitação</th>
                <th className="px-4 py-3 font-medium">Agendamento</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-t border-slate-200/70 align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {service.service_type?.name || `Serviço #${service.id}`}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {service.company?.trade_name || service.company?.name || "Empresa não informada"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {service.location || "Localização não informada"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {service.status ? (
                        <Badge variant={getServiceStatusVariant(service.status)}>
                          {service.status_label || service.status}
                        </Badge>
                      ) : null}
                      {service.priority ? (
                        <Badge variant={getServicePriorityVariant(service.priority)}>
                          {service.priority_label || service.priority}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-slate-500">
                      {service.service_type?.requires_approval
                        ? "Fluxo com aprovacao"
                        : "Fluxo sem aprovacao obrigatória"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>
                      Solicitado por{" "}
                      {service.requester?.name || `Usuário #${service.requested_by}`}
                    </p>
                    <p className="mt-1">
                      Em {formatDateTime(service.requested_at)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <p>Agendado: {formatDateTime(service.scheduled_date)}</p>
                    <p className="mt-1">Início: {formatDateTime(service.started_at)}</p>
                    <p className="mt-1">Fim: {formatDateTime(service.finished_at)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/services/${service.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/services/${service.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setServiceToDelete(service)}
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
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setServiceToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este serviço de{" "}
              {serviceToDelete?.company?.trade_name ||
                serviceToDelete?.company?.name ||
                "empresa não informada"}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setServiceToDelete(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !serviceToDelete}
              onClick={async () => {
                if (!serviceToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(serviceToDelete.id);
                setServiceToDelete(null);
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
