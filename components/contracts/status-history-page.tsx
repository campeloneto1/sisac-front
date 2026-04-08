"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, History, Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useCreateContractStatusHistoryMutation } from "@/hooks/use-contract-status-history-mutations";
import { useContractStatusHistories } from "@/hooks/use-contract-status-histories";
import { useContract } from "@/hooks/use-contracts";
import { usePermissions } from "@/hooks/use-permissions";
import { contractStatusOptions, getContractStatusBadgeVariant, getContractStatusLabel } from "@/types/contract.type";
import type { ContractStatus } from "@/types/contract.type";
import type { CreateContractStatusHistoryDTO } from "@/types/contract-status-history.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ContractSubpageShell } from "@/components/contracts/subpage-shell";

const statusHistorySchema = z.object({
  old_status: z.string(),
  new_status: z.enum(["active", "expired", "suspended", "closed"]),
  changed_at: z.string().min(1, "Informe a data e hora da alteração."),
  reason: z.string().max(1000, "O motivo deve ter no máximo 1000 caracteres.").optional(),
});

type StatusHistoryFormValues = z.output<typeof statusHistorySchema>;

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

function StatusHistoryDialog({
  open,
  onOpenChange,
  contractId,
  defaultOldStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  defaultOldStatus?: ContractStatus | null;
}) {
  const { user } = useAuth();
  const createMutation = useCreateContractStatusHistoryMutation(contractId);
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    register,
    formState: { errors },
  } = useForm<StatusHistoryFormValues>({
    resolver: zodResolver(statusHistorySchema),
    defaultValues: {
      old_status: defaultOldStatus ?? "none",
      new_status: defaultOldStatus ?? "active",
      changed_at: formatDateTimeLocal(new Date().toISOString()),
      reason: "",
    },
  });

  const selectedOldStatus = useWatch({ control, name: "old_status" });
  const selectedNewStatus = useWatch({ control, name: "new_status" });

  useEffect(() => {
    reset({
      old_status: defaultOldStatus ?? "none",
      new_status: defaultOldStatus ?? "active",
      changed_at: formatDateTimeLocal(new Date().toISOString()),
      reason: "",
    });
  }, [defaultOldStatus, open, reset]);

  const isPending = createMutation.isPending;

  async function onSubmit(values: StatusHistoryFormValues) {
    if (!user) {
      return;
    }

    const payload = {
      contract_id: Number(contractId),
      old_status: values.old_status === "none" ? null : (values.old_status as ContractStatus),
      new_status: values.new_status,
      reason: values.reason?.trim() || null,
      changed_by: user.id,
      changed_at: new Date(values.changed_at).toISOString(),
    } satisfies CreateContractStatusHistoryDTO;

    await createMutation.mutateAsync(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo registro de status</DialogTitle>
          <DialogDescription>O histórico e imutavel no backend, entao cada mudança vira um novo evento de auditoria.</DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status anterior</Label>
              <Select value={selectedOldStatus} onValueChange={(value) => setValue("old_status", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Não informar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informar</SelectItem>
                  {contractStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Novo status</Label>
              <Select value={selectedNewStatus} onValueChange={(value) => setValue("new_status", value as ContractStatus, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  {contractStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.new_status ? <p className="text-sm text-destructive">{errors.new_status.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-status-history-changed-at">Data e hora da alteração</Label>
            <Input id="contract-status-history-changed-at" type="datetime-local" {...register("changed_at")} />
            {errors.changed_at ? <p className="text-sm text-destructive">{errors.changed_at.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-status-history-reason">Motivo</Label>
            <Textarea id="contract-status-history-reason" rows={4} placeholder="Descreva o contexto da mudança de status" {...register("reason")} />
            {errors.reason ? <p className="text-sm text-destructive">{errors.reason.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !user}>{isPending ? "Salvando..." : "Registrar alteração"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractStatusHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("contract-status-histories");
  const canViewPage = permissions.canViewAny || permissions.canView;
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isPageEnabled = Boolean(activeSubunit) && canViewPage;
  const contractQuery = useContract(id, isPageEnabled);

  const filters = useMemo(() => ({
    page,
    per_page: 10,
    contract_id: Number(id),
    new_status: statusFilter !== "all" ? (statusFilter as ContractStatus) : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [dateFrom, dateTo, id, page, statusFilter]);

  const historyQuery = useContractStatusHistories(filters, isPageEnabled);

  return (
    <ContractSubpageShell
      title="Histórico de status"
      description="Trilha de auditoria das mudancas de estado do contrato, com usuário responsável, data e justificativa."
      canView={canViewPage}
      permissionDeniedTitle="Acesso negado"
      permissionDeniedDescription="Você precisa da permissão `view` ou `viewAny` para visualizar o histórico de status do contrato."
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Linha do tempo de status</CardTitle>
            <CardDescription>O backend não permite editar nem remover esse histórico, entao cada evento funciona como registro permanente.</CardDescription>
          </div>
          {permissions.canCreate ? (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo evento
            </Button>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status final</Label>
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {contractStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract-status-history-date-from">A partir de</Label>
          <Input id="contract-status-history-date-from" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract-status-history-date-to">Ate</Label>
          <Input id="contract-status-history-date-to" type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} />
        </div>
      </div>

      {historyQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : historyQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar histórico</CardTitle>
            <CardDescription>Verifique se a API de histórico de status do contrato já esta disponível.</CardDescription>
          </CardHeader>
        </Card>
      ) : !historyQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum evento encontrado</CardTitle>
            <CardDescription>Registre aqui as mudancas formais de status do contrato para manter a trilha de auditoria.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {historyQuery.data.data.map((entry) => (
            <Card key={entry.id} className="border-slate-200/70 bg-white/80">
              <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={entry.old_status ? getContractStatusBadgeVariant(entry.old_status) : "outline"}>
                      {entry.old_status_label ?? getContractStatusLabel(entry.old_status ?? "Não informado")}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <Badge variant={getContractStatusBadgeVariant(entry.new_status)}>
                      {entry.new_status_label ?? getContractStatusLabel(entry.new_status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{entry.reason?.trim() || "Sem justificativa informada para esta alteração."}</p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-slate-900">
                    <History className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatDateTime(entry.changed_at)}</span>
                  </div>
                  <p className="mt-2">Responsável: <span className="font-medium text-slate-900">{entry.changed_by_user?.name ?? `Usuário #${entry.changed_by}`}</span></p>
                  <p className="mt-1 text-xs text-slate-500">{entry.changed_by_user?.email ?? "Sem email informado."}</p>
                </div>
              </CardContent>
            </Card>
          ))}

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
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contractId={id}
        defaultOldStatus={contractQuery.data?.data.status}
      />
    </ContractSubpageShell>
  );
}
