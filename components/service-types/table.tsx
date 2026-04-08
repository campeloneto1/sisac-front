"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Eye, Pencil, ShieldCheck, TimerReset, Trash2, XCircle } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteServiceTypeMutation } from "@/hooks/use-service-type-mutations";
import type { ServiceTypeItem } from "@/types/service-type.type";
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

interface ServiceTypesTableProps {
  serviceTypes: ServiceTypeItem[];
}

export function ServiceTypesTable({ serviceTypes }: ServiceTypesTableProps) {
  const permissions = usePermissions("service-types");
  const deleteMutation = useDeleteServiceTypeMutation();
  const [serviceTypeToDelete, setServiceTypeToDelete] =
    useState<ServiceTypeItem | null>(null);

  async function handleDelete() {
    if (!serviceTypeToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(serviceTypeToDelete.id);
    setServiceTypeToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Codigo</th>
                <th className="px-4 py-3 font-medium">Configuração</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {serviceTypes.map((serviceType) => (
                <tr
                  key={serviceType.id}
                  className="border-t border-slate-200/70 align-top"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {serviceType.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={serviceType.active ? "success" : "secondary"}>
                          {serviceType.active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge
                          variant={serviceType.requires_approval ? "info" : "outline"}
                        >
                          {serviceType.requires_approval
                            ? "Requer aprovacao"
                            : "Sem aprovacao"}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{serviceType.code}</td>
                  <td className="px-4 py-4 text-slate-600">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {serviceType.active ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                        <span>{serviceType.active ? "Disponível" : "Bloqueado"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>
                          {serviceType.requires_approval
                            ? "Aprovacao obrigatória"
                            : "Aprovacao opcional"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TimerReset className="h-4 w-4 text-primary" />
                        <span>
                          {serviceType.estimated_duration_hours
                            ? `${serviceType.estimated_duration_hours}h estimadas`
                            : "Sem duracao estimada"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {serviceType.description?.trim() || "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/service-types/${serviceType.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/service-types/${serviceType.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setServiceTypeToDelete(serviceType)}
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
        open={Boolean(serviceTypeToDelete)}
        onOpenChange={(open) => !open && setServiceTypeToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir tipo de serviço</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {serviceTypeToDelete?.name}? Se
              houver serviços vinculados, a API podera recusar a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setServiceTypeToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
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
