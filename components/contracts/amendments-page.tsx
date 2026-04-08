"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgePercent, Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";

import { useCreateContractAmendmentMutation, useDeleteContractAmendmentMutation, useUpdateContractAmendmentMutation } from "@/hooks/use-contract-amendment-mutations";
import { useContractAmendments } from "@/hooks/use-contract-amendments";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractAmendmentItem, CreateContractAmendmentDTO, UpdateContractAmendmentDTO } from "@/types/contract-amendment.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ContractSubpageShell } from "@/components/contracts/subpage-shell";

const amendmentSchema = z.object({
  amendment_number: z.string().max(100, "Número muito longo.").optional(),
  type: z.string().max(100, "Tipo muito longo.").optional(),
  value: z.string().optional(),
  percentage: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().max(5000, "As observações devem ter no máximo 5000 caracteres.").optional(),
});

type AmendmentFormValues = z.infer<typeof amendmentSchema>;

function formatCurrency(value?: string | number | null) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

function formatDate(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "Não informado";
}

function AmendmentDialog({
  open,
  onOpenChange,
  contractId,
  amendment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  amendment?: ContractAmendmentItem | null;
}) {
  const createMutation = useCreateContractAmendmentMutation(contractId);
  const updateMutation = useUpdateContractAmendmentMutation(contractId);
  const { handleSubmit, register, reset, formState: { errors } } = useForm<AmendmentFormValues>({
    resolver: zodResolver(amendmentSchema),
    defaultValues: {
      amendment_number: amendment?.amendment_number ?? "",
      type: amendment?.type ?? "",
      value: amendment?.value?.toString() ?? "",
      percentage: amendment?.percentage?.toString() ?? "",
      date: amendment?.date ?? "",
      notes: amendment?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      amendment_number: amendment?.amendment_number ?? "",
      type: amendment?.type ?? "",
      value: amendment?.value?.toString() ?? "",
      percentage: amendment?.percentage?.toString() ?? "",
      date: amendment?.date ?? "",
      notes: amendment?.notes ?? "",
    });
  }, [amendment, open, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: AmendmentFormValues) {
    const payloadBase = {
      contract_id: Number(contractId),
      amendment_number: values.amendment_number?.trim() || null,
      type: values.type?.trim() || null,
      value: values.value?.trim() ? Number(values.value) : null,
      percentage: values.percentage?.trim() ? Number(values.percentage) : null,
      date: values.date || null,
      notes: values.notes?.trim() || null,
    };

    if (amendment) {
      await updateMutation.mutateAsync({ id: amendment.id, payload: payloadBase satisfies UpdateContractAmendmentDTO });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateContractAmendmentDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{amendment ? "Editar aditivo" : "Novo aditivo"}</DialogTitle>
          <DialogDescription>Cadastre alterações contratuais com rastreabilidade de tipo, data e impacto financeiro.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-amendment-number">Número</Label>
              <Input id="contract-amendment-number" placeholder="Ex.: AD-2026-01" {...register("amendment_number")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-amendment-type">Tipo</Label>
              <Input id="contract-amendment-type" placeholder="Ex.: Reequilibrio financeiro" {...register("type")} />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="contract-amendment-value">Valor</Label>
              <Input id="contract-amendment-value" type="number" step="0.01" placeholder="0,00" {...register("value")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-amendment-percentage">Percentual</Label>
              <Input id="contract-amendment-percentage" type="number" step="0.01" placeholder="0,00" {...register("percentage")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-amendment-date">Data</Label>
              <Input id="contract-amendment-date" type="date" {...register("date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-amendment-notes">Observações</Label>
            <Textarea id="contract-amendment-notes" rows={4} placeholder="Contexto do aditivo" {...register("notes")} />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : amendment ? "Salvar aditivo" : "Criar aditivo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractAmendmentsPage() {
  const { id } = useParams<{ id: string }>();
  const permissions = usePermissions("contract-amendments");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editingAmendment, setEditingAmendment] = useState<ContractAmendmentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amendmentToDelete, setAmendmentToDelete] = useState<ContractAmendmentItem | null>(null);
  const deleteMutation = useDeleteContractAmendmentMutation(id);

  const filters = useMemo(() => ({
    page,
    per_page: 10,
    search: search || undefined,
    type: typeFilter || undefined,
  }), [page, search, typeFilter]);

  const amendmentsQuery = useContractAmendments(id, filters, permissions.canViewAny);

  async function handleDelete() {
    if (!amendmentToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(amendmentToDelete.id);
    setAmendmentToDelete(null);
  }

  return (
    <ContractSubpageShell
      title="Aditivos do contrato"
      description="Centralize alterações de escopo, valor e percentual em uma trilha auditavel."
      canView={permissions.canViewAny}
      permissionDeniedTitle="Acesso negado"
      permissionDeniedDescription="Você precisa da permissão `viewAny` para visualizar os aditivos do contrato."
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Histórico de aditivos</CardTitle>
            <CardDescription>Acompanhe alterações financeiras e administrativas com contexto suficiente para analise.</CardDescription>
          </div>
          {permissions.canCreate ? (
            <Button onClick={() => { setEditingAmendment(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo aditivo
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="contract-amendment-search">Busca</Label>
          <Input id="contract-amendment-search" placeholder="Busque por número ou observações" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract-amendment-type-filter">Tipo</Label>
          <Input id="contract-amendment-type-filter" placeholder="Ex.: reajuste" value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(1); }} />
        </div>
      </div>

      {amendmentsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : amendmentsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar aditivos</CardTitle>
            <CardDescription>Verifique se o endpoint de aditivos do contrato já esta publicado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !amendmentsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum aditivo encontrado</CardTitle>
            <CardDescription>Cadastre aqui os aditivos vinculados a este contrato.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Número / tipo</th>
                    <th className="px-4 py-3 font-medium">Impacto</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Resumo</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {amendmentsQuery.data.data.map((amendment) => (
                    <tr key={amendment.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <div>
                          <Badge variant="warning">{amendment.amendment_number ?? `Aditivo #${amendment.id}`}</Badge>
                          <p className="mt-2 text-sm text-slate-600">{amendment.type ?? "Tipo não informado"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ReceiptText className="h-4 w-4 text-primary" />
                            <span>{formatCurrency(amendment.value)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BadgePercent className="h-4 w-4 text-primary" />
                            <span>{amendment.percentage ?? 0}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(amendment.date)}</td>
                      <td className="px-4 py-4 text-slate-600">{amendment.notes?.trim() || "Sem observações informadas."}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canUpdate ? (
                            <Button size="icon" variant="outline" onClick={() => { setEditingAmendment(amendment); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {permissions.canDelete ? (
                            <Button size="icon" variant="outline" onClick={() => setAmendmentToDelete(amendment)}>
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

          <Pagination
            currentPage={amendmentsQuery.data.meta.current_page}
            lastPage={amendmentsQuery.data.meta.last_page}
            total={amendmentsQuery.data.meta.total}
            from={amendmentsQuery.data.meta.from}
            to={amendmentsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={amendmentsQuery.isFetching}
          />
        </div>
      )}

      <AmendmentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} contractId={id} amendment={editingAmendment} />

      <Dialog open={Boolean(amendmentToDelete)} onOpenChange={(open) => !open && setAmendmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir aditivo</DialogTitle>
            <DialogDescription>Tem certeza que deseja remover este aditivo do contrato?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAmendmentToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContractSubpageShell>
  );
}
