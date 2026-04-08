"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCheck, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import {
  useAcknowledgeContractAlertMutation,
  useCreateContractAlertMutation,
  useDeleteContractAlertMutation,
  useResolveContractAlertMutation,
  useUpdateContractAlertMutation,
} from "@/hooks/use-contract-alert-mutations";
import { useContractAlerts } from "@/hooks/use-contract-alerts";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import {
  contractAlertStatusOptions,
  contractAlertTypeOptions,
  getContractAlertBadgeVariant,
  getContractAlertStatusLabel,
  getContractAlertTypeLabel,
} from "@/types/contract-alert.type";
import type {
  ContractAlertItem,
  ContractAlertStatus,
  ContractAlertType,
  CreateContractAlertDTO,
  UpdateContractAlertDTO,
} from "@/types/contract-alert.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ContractSubpageShell } from "@/components/contracts/subpage-shell";

const alertSchema = z.object({
  type: z.enum(contractAlertTypeOptions.map((option) => option.value) as [ContractAlertType, ...ContractAlertType[]]),
  status: z.enum(contractAlertStatusOptions.map((option) => option.value) as [ContractAlertStatus, ...ContractAlertStatus[]]),
  message: z.string().min(5, "A mensagem deve ter ao menos 5 caracteres.").max(1000, "A mensagem deve ter no máximo 1000 caracteres."),
  alert_date: z.string().min(1, "Informe a data e hora do alerta."),
});

type AlertFormValues = z.output<typeof alertSchema>;

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
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

function AlertDialog({
  open,
  onOpenChange,
  contractId,
  alert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  alert?: ContractAlertItem | null;
}) {
  const createMutation = useCreateContractAlertMutation(contractId);
  const updateMutation = useUpdateContractAlertMutation(contractId);
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    register,
    formState: { errors },
  } = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: alert?.type ?? "expiration_1_month",
      status: alert?.status ?? "pending",
      message: alert?.message ?? "",
      alert_date: formatDateTimeLocal(alert?.alert_date ?? new Date().toISOString()),
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const selectedStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    reset({
      type: alert?.type ?? "expiration_1_month",
      status: alert?.status ?? "pending",
      message: alert?.message ?? "",
      alert_date: formatDateTimeLocal(alert?.alert_date ?? new Date().toISOString()),
    });
  }, [alert, open, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: AlertFormValues) {
    const payloadBase = {
      contract_id: Number(contractId),
      type: values.type,
      status: values.status,
      message: values.message.trim(),
      alert_date: new Date(values.alert_date).toISOString(),
    };

    if (alert) {
      await updateMutation.mutateAsync({
        id: alert.id,
        payload: payloadBase satisfies UpdateContractAlertDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateContractAlertDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{alert ? "Editar alerta" : "Novo alerta"}</DialogTitle>
          <DialogDescription>Registre alertas operacionais e financeiros vinculados ao contrato e acompanhe o tratamento de cada um.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={(value) => setValue("type", value as ContractAlertType, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {contractAlertTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setValue("status", value as ContractAlertStatus, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {contractAlertStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-alert-date">Data e hora do alerta</Label>
            <Input id="contract-alert-date" type="datetime-local" {...register("alert_date")} />
            {errors.alert_date ? <p className="text-sm text-destructive">{errors.alert_date.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-alert-message">Mensagem</Label>
            <Textarea id="contract-alert-message" rows={4} placeholder="Descreva o risco, prazo ou contexto do alerta" {...register("message")} />
            {errors.message ? <p className="text-sm text-destructive">{errors.message.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : alert ? "Salvar alerta" : "Criar alerta"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractAlertsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("contract-alerts");
  const canViewPage = permissions.canViewAny || permissions.canView;
  const canAcknowledge = hasPermission(user, "contract-alerts.acknowledge");
  const canResolve = hasPermission(user, "contract-alerts.resolve");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingAlert, setEditingAlert] = useState<ContractAlertItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<ContractAlertItem | null>(null);
  const deleteMutation = useDeleteContractAlertMutation(id);
  const acknowledgeMutation = useAcknowledgeContractAlertMutation(id);
  const resolveMutation = useResolveContractAlertMutation(id);
  const isPageEnabled = Boolean(activeSubunit) && canViewPage;

  const filters = useMemo(() => ({
    page,
    per_page: 10,
    contract_id: Number(id),
    search: search || undefined,
    type: typeFilter !== "all" ? (typeFilter as ContractAlertType) : undefined,
    status: statusFilter !== "all" ? (statusFilter as ContractAlertStatus) : undefined,
  }), [id, page, search, statusFilter, typeFilter]);

  const alertsQuery = useContractAlerts(filters, isPageEnabled);

  async function handleDelete() {
    if (!alertToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(alertToDelete.id);
    setAlertToDelete(null);
  }

  return (
    <ContractSubpageShell
      title="Alertas do contrato"
      description="Centralize alertas de execução financeira e vencimento com acompanhamento de reconhecimento e resolucao."
      canView={canViewPage}
      permissionDeniedTitle="Acesso negado"
      permissionDeniedDescription="Você precisa da permissão `view` ou `viewAny` para visualizar os alertas do contrato."
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Painel de alertas</CardTitle>
            <CardDescription>Filtre riscos por tipo, status e palavras-chave, e aja rápido quando houver reconhecimento ou resolucao pendente.</CardDescription>
          </div>
          {permissions.canCreate ? (
            <Button onClick={() => { setEditingAlert(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo alerta
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="contract-alert-search">Busca</Label>
          <Input id="contract-alert-search" placeholder="Busque por mensagem" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {contractAlertTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {contractAlertStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {alertsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : alertsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar alertas</CardTitle>
            <CardDescription>Verifique se a API de alertas do contrato já esta disponível.</CardDescription>
          </CardHeader>
        </Card>
      ) : !alertsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum alerta encontrado</CardTitle>
            <CardDescription>Cadastre alertas para prazos, execução orcamentaria ou outras sinalizacoes operacionais do contrato.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Mensagem</th>
                    <th className="px-4 py-3 font-medium">Datas</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsQuery.data.data.map((alert) => (
                    <tr key={alert.id} className="border-t border-slate-200/70 align-top">
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <Badge variant={getContractAlertBadgeVariant(alert.type_color)}>
                            {alert.type_label ?? getContractAlertTypeLabel(alert.type)}
                          </Badge>
                          <p className="text-xs text-slate-500">Prioridade {alert.type_priority ?? "-"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={getContractAlertBadgeVariant(alert.status_color)}>
                          {alert.status_label ?? getContractAlertStatusLabel(alert.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{alert.message}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>Alerta: {formatDateTime(alert.alert_date)}</p>
                        <p className="mt-1 text-xs text-slate-500">Reconhecido: {formatDateTime(alert.acknowledged_at)}</p>
                        <p className="mt-1 text-xs text-slate-500">Resolvido: {formatDateTime(alert.resolved_at)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {permissions.canUpdate ? (
                            <Button size="icon" variant="outline" onClick={() => { setEditingAlert(alert); setIsDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {canAcknowledge && alert.status === "pending" ? (
                            <Button size="sm" variant="outline" disabled={acknowledgeMutation.isPending} onClick={() => void acknowledgeMutation.mutateAsync(alert.id)}>
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Reconhecer
                            </Button>
                          ) : null}
                          {canResolve && alert.status !== "resolved" ? (
                            <Button size="sm" variant="outline" disabled={resolveMutation.isPending} onClick={() => void resolveMutation.mutateAsync(alert.id)}>
                              <CheckCheck className="mr-2 h-4 w-4" />
                              Resolver
                            </Button>
                          ) : null}
                          {permissions.canDelete ? (
                            <Button size="icon" variant="outline" onClick={() => setAlertToDelete(alert)}>
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
            currentPage={alertsQuery.data.meta.current_page}
            lastPage={alertsQuery.data.meta.last_page}
            total={alertsQuery.data.meta.total}
            from={alertsQuery.data.meta.from}
            to={alertsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={alertsQuery.isFetching}
          />
        </div>
      )}

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} contractId={id} alert={editingAlert} />

      <Dialog open={Boolean(alertToDelete)} onOpenChange={(open) => !open && setAlertToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir alerta</DialogTitle>
            <DialogDescription>Tem certeza que deseja remover este alerta do contrato?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAlertToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContractSubpageShell>
  );
}
