"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";

import { useCreateContractExtensionMutation, useDeleteContractExtensionMutation, useUpdateContractExtensionMutation } from "@/hooks/use-contract-extension-mutations";
import { useContractExtensions } from "@/hooks/use-contract-extensions";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractExtensionItem, CreateContractExtensionDTO, UpdateContractExtensionDTO } from "@/types/contract-extension.type";
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

const extensionSchema = z.object({
  extension_number: z.string().max(100, "Número muito longo.").optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().max(5000, "As observações devem ter no máximo 5000 caracteres.").optional(),
}).refine((values) => !values.start_date || !values.end_date || values.end_date >= values.start_date, {
  message: "A data final precisa ser posterior a data inicial.",
  path: ["end_date"],
});

type ExtensionFormValues = z.infer<typeof extensionSchema>;

function formatDate(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "Não informado";
}

function ExtensionDialog({
  open,
  onOpenChange,
  contractId,
  extension,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  extension?: ContractExtensionItem | null;
}) {
  const createMutation = useCreateContractExtensionMutation(contractId);
  const updateMutation = useUpdateContractExtensionMutation(contractId);
  const { handleSubmit, register, reset, formState: { errors } } = useForm<ExtensionFormValues>({
    resolver: zodResolver(extensionSchema),
    defaultValues: {
      extension_number: extension?.extension_number ?? "",
      start_date: extension?.start_date ?? "",
      end_date: extension?.end_date ?? "",
      notes: extension?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      extension_number: extension?.extension_number ?? "",
      start_date: extension?.start_date ?? "",
      end_date: extension?.end_date ?? "",
      notes: extension?.notes ?? "",
    });
  }, [extension, open, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: ExtensionFormValues) {
    const payloadBase = {
      contract_id: Number(contractId),
      extension_number: values.extension_number?.trim() || null,
      start_date: values.start_date || null,
      end_date: values.end_date || null,
      notes: values.notes?.trim() || null,
    };

    if (extension) {
      await updateMutation.mutateAsync({ id: extension.id, payload: payloadBase satisfies UpdateContractExtensionDTO });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateContractExtensionDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{extension ? "Editar prorrogacao" : "Nova prorrogacao"}</DialogTitle>
          <DialogDescription>Registre a nova janela de vigência e o contexto administrativo da prorrogacao.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="contract-extension-number">Número</Label>
            <Input id="contract-extension-number" placeholder="Ex.: PR-2026-01" {...register("extension_number")} />
            {errors.extension_number ? <p className="text-sm text-destructive">{errors.extension_number.message}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-extension-start-date">Início</Label>
              <Input id="contract-extension-start-date" type="date" {...register("start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-extension-end-date">Fim</Label>
              <Input id="contract-extension-end-date" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-extension-notes">Observações</Label>
            <Textarea id="contract-extension-notes" rows={4} placeholder="Descreva o motivo da prorrogacao" {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : extension ? "Salvar prorrogacao" : "Criar prorrogacao"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractExtensionsPage() {
  const { id } = useParams<{ id: string }>();
  const permissions = usePermissions("contract-extensions");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingExtension, setEditingExtension] = useState<ContractExtensionItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [extensionToDelete, setExtensionToDelete] = useState<ContractExtensionItem | null>(null);
  const deleteMutation = useDeleteContractExtensionMutation(id);

  const filters = useMemo(() => ({
    page,
    per_page: 10,
    search: search || undefined,
  }), [page, search]);

  const extensionsQuery = useContractExtensions(id, filters, permissions.canViewAny);

  async function handleDelete() {
    if (!extensionToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(extensionToDelete.id);
    setExtensionToDelete(null);
  }

  return (
    <ContractSubpageShell
      title="Prorrogacoes do contrato"
      description="Acompanhe o histórico de extensoes de vigência sem perder o contexto do contrato pai."
      canView={permissions.canViewAny}
      permissionDeniedTitle="Acesso negado"
      permissionDeniedDescription="Você precisa da permissão `viewAny` para visualizar as prorrogacoes do contrato."
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Histórico de prorrogacoes</CardTitle>
            <CardDescription>Consulte rapidamente o número, a vigência e o racional de cada extensao.</CardDescription>
          </div>
          {permissions.canCreate ? (
            <Button onClick={() => { setEditingExtension(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova prorrogacao
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4">
        <div className="space-y-2">
          <Label htmlFor="contract-extension-search">Busca</Label>
          <Input id="contract-extension-search" placeholder="Busque por número ou observações" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
      </div>

      {extensionsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : extensionsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar prorrogacoes</CardTitle>
            <CardDescription>Verifique se a API de prorrogacoes do contrato já esta disponível.</CardDescription>
          </CardHeader>
        </Card>
      ) : !extensionsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma prorrogacao encontrada</CardTitle>
            <CardDescription>Cadastre as extensoes de vigência conforme forem aprovadas para o contrato.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Número</th>
                    <th className="px-4 py-3 font-medium">Vigência</th>
                    <th className="px-4 py-3 font-medium">Resumo</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {extensionsQuery.data.data.map((extension) => (
                    <tr key={extension.id} className="border-t border-slate-200/70">
                      <td className="px-4 py-4">
                        <Badge variant="info">{extension.extension_number ?? `Prorrogacao #${extension.id}`}</Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-4 w-4 text-primary" />
                          <span>{formatDate(extension.start_date)} ate {formatDate(extension.end_date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{extension.notes?.trim() || "Sem observações informadas."}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {permissions.canUpdate ? (
                            <Button size="icon" variant="outline" onClick={() => { setEditingExtension(extension); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {permissions.canDelete ? (
                            <Button size="icon" variant="outline" onClick={() => setExtensionToDelete(extension)}>
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
            currentPage={extensionsQuery.data.meta.current_page}
            lastPage={extensionsQuery.data.meta.last_page}
            total={extensionsQuery.data.meta.total}
            from={extensionsQuery.data.meta.from}
            to={extensionsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={extensionsQuery.isFetching}
          />
        </div>
      )}

      <ExtensionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} contractId={id} extension={editingExtension} />

      <Dialog open={Boolean(extensionToDelete)} onOpenChange={(open) => !open && setExtensionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir prorrogacao</DialogTitle>
            <DialogDescription>Tem certeza que deseja remover esta prorrogacao do contrato?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setExtensionToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContractSubpageShell>
  );
}
