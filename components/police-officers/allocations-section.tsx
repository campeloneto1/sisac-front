"use client";

import { useMemo, useState } from "react";
import { Building2, Pencil, Plus, Trash2, Workflow } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useDeletePoliceOfficerAllocationMutation } from "@/hooks/use-police-officer-allocation-mutations";
import { usePoliceOfficerAllocations } from "@/hooks/use-police-officer-allocations";
import { usePermissions } from "@/hooks/use-permissions";
import type { PoliceOfficerAllocationItem } from "@/types/police-officer-allocation.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerAllocationsDialog } from "@/components/police-officers/allocations-dialog";

interface PoliceOfficerAllocationsSectionProps {
  policeOfficerId: number;
  policeOfficerName: string;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Atual";
  }

  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return value;
  }
}

export function PoliceOfficerAllocationsSection({
  policeOfficerId,
  policeOfficerName,
}: PoliceOfficerAllocationsSectionProps) {
  const permissions = usePermissions("police-officer-allocations");
  const deleteMutation = useDeletePoliceOfficerAllocationMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<PoliceOfficerAllocationItem | null>(null);
  const [allocationToDelete, setAllocationToDelete] = useState<PoliceOfficerAllocationItem | null>(null);
  const filters = useMemo(
    () => ({
      police_officer_id: policeOfficerId,
      per_page: 100,
    }),
    [policeOfficerId],
  );
  const allocationsQuery = usePoliceOfficerAllocations(filters, permissions.canViewAny || permissions.canView);

  async function handleDelete() {
    if (!allocationToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(allocationToDelete.id);
    setAllocationToDelete(null);
  }

  if (!permissions.canViewAny && !permissions.canView) {
    return null;
  }

  const allocations = allocationsQuery.data?.data ?? [];

  return (
    <>
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Alocações</CardTitle>
            <CardDescription>Histórico de lotação funcional do policial por setor e função.</CardDescription>
          </div>

          {permissions.canCreate ? (
            <Button
              onClick={() => {
                setEditingAllocation(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova alocação
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {allocationsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : allocationsQuery.isError ? (
            <p className="text-sm text-slate-500">Não foi possível carregar o histórico de alocações.</p>
          ) : allocations.length ? (
            <div className="space-y-3">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {allocation.assignment?.name ?? "Função não informada"}
                        </p>
                        {allocation.is_current ? <Badge>Atual</Badge> : <Badge variant="outline">Histórico</Badge>}
                        {allocation.assignment?.category ? (
                          <Badge variant="secondary" className="capitalize">
                            {allocation.assignment.category}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>
                            {allocation.sector?.name ?? "Setor não informado"}
                            {allocation.sector?.abbreviation ? ` (${allocation.sector.abbreviation})` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Workflow className="h-4 w-4 text-primary" />
                          <span>
                            {formatDate(allocation.start_date)} até {formatDate(allocation.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {permissions.canUpdate ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingAllocation(allocation);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}

                      {permissions.canDelete && !allocation.is_current ? (
                        <Button size="icon" variant="outline" onClick={() => setAllocationToDelete(allocation)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma alocação encontrada para este policial.</p>
          )}
        </CardContent>
      </Card>

      <PoliceOfficerAllocationsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        policeOfficerId={policeOfficerId}
        policeOfficerName={policeOfficerName}
        allocation={editingAllocation}
      />

      <Dialog open={Boolean(allocationToDelete)} onOpenChange={(open) => !open && setAllocationToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir alocação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta alocação encerrada? A ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAllocationToDelete(null)}>
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
