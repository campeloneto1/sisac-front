"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  History,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import {
  useCreateServiceStatusHistoryMutation,
  useDeleteServiceStatusHistoryMutation,
  useUpdateServiceStatusHistoryMutation,
} from "@/hooks/use-service-status-history-mutations";
import { useServiceStatusHistories } from "@/hooks/use-service-status-histories";
import { useService } from "@/hooks/use-services";
import { usePermissions } from "@/hooks/use-permissions";
import {
  getServiceStatusVariant,
  serviceStatusOptions,
  type ServiceStatus,
} from "@/types/service.type";
import type {
  CreateServiceStatusHistoryDTO,
  ServiceStatusHistoryFilters,
  ServiceStatusHistoryItem,
  UpdateServiceStatusHistoryDTO,
} from "@/types/service-status-history.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const historyDialogSchema = z.object({
  from_status: z.string(),
  to_status: z.enum([
    "solicitado",
    "aprovado",
    "agendado",
    "em_andamento",
    "pausado",
    "concluido",
    "cancelado",
    "abandonado",
  ]),
  notes: z
    .string()
    .max(2000, "As observacoes devem ter no maximo 2000 caracteres.")
    .optional()
    .or(z.literal("")),
  changed_at: z.string().optional().or(z.literal("")),
});

type HistoryDialogValues = z.output<typeof historyDialogSchema>;

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
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusHistoryDialog({
  mode,
  open,
  onOpenChange,
  serviceId,
  defaultFromStatus,
  history,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  defaultFromStatus?: ServiceStatus | null;
  history?: ServiceStatusHistoryItem | null;
}) {
  const { user } = useAuth();
  const createMutation = useCreateServiceStatusHistoryMutation(serviceId);
  const updateMutation = useUpdateServiceStatusHistoryMutation(serviceId);
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    register,
    formState: { errors },
  } = useForm<HistoryDialogValues>({
    resolver: zodResolver(historyDialogSchema),
    defaultValues: {
      from_status: history?.from_status ?? defaultFromStatus ?? "none",
      to_status: history?.to_status ?? defaultFromStatus ?? "solicitado",
      notes: history?.notes ?? "",
      changed_at: history?.changed_at ? formatDateTimeLocal(history.changed_at) : "",
    },
  });

  const selectedFromStatus = useWatch({ control, name: "from_status" });
  const selectedToStatus = useWatch({ control, name: "to_status" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    reset({
      from_status: history?.from_status ?? defaultFromStatus ?? "none",
      to_status: history?.to_status ?? defaultFromStatus ?? "solicitado",
      notes: history?.notes ?? "",
      changed_at: history?.changed_at ? formatDateTimeLocal(history.changed_at) : "",
    });
  }, [defaultFromStatus, history, open, reset]);

  async function onSubmit(values: HistoryDialogValues) {
    if (!user) {
      return;
    }

    if (mode === "create") {
      const payload = {
        service_id: Number(serviceId),
        from_status:
          values.from_status === "none"
            ? null
            : (values.from_status as ServiceStatus),
        to_status: values.to_status,
        notes: values.notes?.trim() || null,
        changed_by: user.id,
      } satisfies CreateServiceStatusHistoryDTO;

      await createMutation.mutateAsync(payload);
      onOpenChange(false);
      return;
    }

    if (!history) {
      return;
    }

    const payload = {
      from_status:
        values.from_status === "none"
          ? null
          : (values.from_status as ServiceStatus),
      to_status: values.to_status,
      notes: values.notes?.trim() || null,
      changed_at: values.changed_at
        ? new Date(values.changed_at).toISOString()
        : null,
    } satisfies UpdateServiceStatusHistoryDTO;

    await updateMutation.mutateAsync({ id: history.id, payload });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Novo evento de status" : "Editar evento de status"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Registre uma transicao de status para o servico atual. O horario do registro pode ser assumido automaticamente pela API."
              : "Ajuste os dados do evento de historico quando houver necessidade de correcao administrativa."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status anterior</Label>
              <Select
                value={selectedFromStatus}
                onValueChange={(value) =>
                  setValue("from_status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nao informar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nao informar</SelectItem>
                  {serviceStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Novo status</Label>
              <Select
                value={selectedToStatus}
                onValueChange={(value) =>
                  setValue("to_status", value as ServiceStatus, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  {serviceStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.to_status ? (
                <p className="text-sm text-destructive">
                  {errors.to_status.message}
                </p>
              ) : null}
            </div>
          </div>

          {mode === "edit" ? (
            <div className="space-y-2">
              <Label htmlFor="service-status-history-changed-at">
                Data e hora da alteracao
              </Label>
              <Input
                id="service-status-history-changed-at"
                type="datetime-local"
                {...register("changed_at")}
              />
              <p className="text-xs text-slate-500">
                Deixe em branco para manter o horario atual registrado nesse
                evento.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              O usuario autenticado sera usado como responsavel pela mudanca e o
              horario pode ser definido automaticamente pela API.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service-status-history-notes">Observacoes</Label>
            <Textarea
              id="service-status-history-notes"
              rows={4}
              placeholder="Descreva o contexto da mudanca de status"
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !user}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Registrar alteracao"
                  : "Salvar alteracao"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceStatusHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const { user } = useAuth();
  const permissions = usePermissions("service-status-history");
  const canViewPage = permissions.canViewAny || permissions.canView;
  const [fromStatus, setFromStatus] = useState("all");
  const [toStatus, setToStatus] = useState("all");
  const [changedBy, setChangedBy] = useState("me");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [historyToEdit, setHistoryToEdit] =
    useState<ServiceStatusHistoryItem | null>(null);
  const [historyToDelete, setHistoryToDelete] =
    useState<ServiceStatusHistoryItem | null>(null);
  const isPageEnabled = Boolean(activeSubunit) && canViewPage;
  const serviceQuery = useService(id, isPageEnabled);
  const deleteMutation = useDeleteServiceStatusHistoryMutation(id);

  const filters = useMemo<ServiceStatusHistoryFilters>(
    () => ({
      page,
      per_page: 10,
      service_id: Number(id),
      from_status:
        fromStatus !== "all" ? (fromStatus as ServiceStatus) : undefined,
      to_status: toStatus !== "all" ? (toStatus as ServiceStatus) : undefined,
      changed_by:
        changedBy === "all"
          ? undefined
          : changedBy === "me"
            ? user?.id
            : Number(changedBy),
      changed_at_from: dateFrom || undefined,
      changed_at_to: dateTo || undefined,
    }),
    [changedBy, dateFrom, dateTo, id, page, fromStatus, toStatus, user?.id],
  );

  const historyQuery = useServiceStatusHistories(filters, isPageEnabled);

  if (!canViewPage) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` ou `view` para acessar o
            historico de status dos servicos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>
            O historico de status depende da subunidade ativa para enviar
            `X-Active-Subunit`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Historico de status
            </h1>
            <p className="text-sm text-slate-500">
              Trilha de auditoria das transicoes de status do servico atual.
            </p>
            {serviceQuery.data?.data ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Link
                  href={`/services/${id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {serviceQuery.data.data.service_type?.name || `Servico #${id}`}
                </Link>
                <ArrowRight className="h-4 w-4 text-slate-300" />
                {serviceQuery.data.data.status ? (
                  <Badge
                    variant={getServiceStatusVariant(serviceQuery.data.data.status)}
                  >
                    {serviceQuery.data.data.status_label ||
                      serviceQuery.data.data.status}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {permissions.canCreate ? (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo evento
          </Button>
        ) : null}
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-5">
          <div className="space-y-2">
            <Label>Status anterior</Label>
            <Select
              value={fromStatus}
              onValueChange={(value) => {
                setFromStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {serviceStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Novo status</Label>
            <Select
              value={toStatus}
              onValueChange={(value) => {
                setToStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {serviceStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Responsavel</Label>
            <Select
              value={changedBy}
              onValueChange={(value) => {
                setChangedBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="me">Meu usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-status-history-date-from">A partir de</Label>
            <Input
              id="service-status-history-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-status-history-date-to">Ate</Label>
            <Input
              id="service-status-history-date-to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFromStatus("all");
                setToStatus("all");
                setChangedBy("me");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {serviceQuery.isLoading || historyQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : serviceQuery.isError || !serviceQuery.data?.data ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Servico indisponivel</CardTitle>
            <CardDescription>
              Nao foi possivel carregar o servico vinculado a esse historico.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : historyQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar historico</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !historyQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum evento encontrado</CardTitle>
            <CardDescription>
              Registre a primeira mudanca de status ou ajuste os filtros
              aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Transicao</th>
                    <th className="px-4 py-3 font-medium">Responsavel</th>
                    <th className="px-4 py-3 font-medium">Momento</th>
                    <th className="px-4 py-3 font-medium">Observacoes</th>
                    <th className="px-4 py-3 font-medium text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {historyQuery.data.data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-200/70 align-top"
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.from_status ? (
                            <Badge variant={getServiceStatusVariant(item.from_status)}>
                              {item.from_status_label || item.from_status}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sem anterior</Badge>
                          )}
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                          {item.to_status ? (
                            <Badge variant={getServiceStatusVariant(item.to_status)}>
                              {item.to_status_label || item.to_status}
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>{item.changer?.name || `Usuario #${item.changed_by}`}</p>
                        <p className="mt-1 text-slate-500">
                          {item.changer?.email || "Sem e-mail vinculado"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>Alterado em {formatDateTime(item.changed_at)}</p>
                        <p className="mt-1 text-slate-500">
                          Criado em {formatDateTime(item.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {item.notes || "Sem observacoes"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setHistoryToEdit(item)}
                            disabled={!permissions.canUpdate}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {permissions.canUpdate ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setHistoryToEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          ) : null}

                          {permissions.canDelete ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setHistoryToDelete(item)}
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

          <Pagination
            currentPage={historyQuery.data.meta.current_page}
            lastPage={historyQuery.data.meta.last_page}
            total={historyQuery.data.meta.total}
            from={historyQuery.data.meta.from}
            to={historyQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={historyQuery.isFetching}
          />
        </div>
      )}

      <StatusHistoryDialog
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        serviceId={id}
        defaultFromStatus={serviceQuery.data?.data.status ?? null}
      />

      <StatusHistoryDialog
        mode="edit"
        open={Boolean(historyToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            setHistoryToEdit(null);
          }
        }}
        serviceId={id}
        defaultFromStatus={serviceQuery.data?.data.status ?? null}
        history={historyToEdit}
      />

      <Dialog
        open={Boolean(historyToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setHistoryToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir evento de historico</DialogTitle>
            <DialogDescription>
              Essa remocao apaga o registro da trilha de auditoria do servico.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setHistoryToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending || !historyToDelete}
              onClick={async () => {
                if (!historyToDelete) {
                  return;
                }

                await deleteMutation.mutateAsync(historyToDelete.id);
                setHistoryToDelete(null);
              }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
