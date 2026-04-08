"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { History, Landmark, MapPinned, Pencil, Repeat, ShieldAlert, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useSubunit } from "@/contexts/subunit-context";
import { usePatrimony, usePatrimonyHistory } from "@/hooks/use-patrimonies";
import { usePermissions } from "@/hooks/use-permissions";
import { useDisposePatrimonyMutation, useTransferPatrimonyMutation } from "@/hooks/use-patrimony-mutations";
import { useSectors } from "@/hooks/use-sectors";
import {
  getPatrimonyStatusVariant,
  patrimonyDisposeStatusOptions,
  type PatrimonyStatusValue,
} from "@/types/patrimony.type";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function PatrimonyShowPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");
  const isEnabled = Boolean(activeSubunit) && permissions.canView;
  const patrimonyQuery = usePatrimony(id, isEnabled);
  const historyPreviewQuery = usePatrimonyHistory(id, isEnabled);
  const sectorsQuery = useSectors({ per_page: 100 }, isEnabled);
  const transferMutation = useTransferPatrimonyMutation();
  const disposeMutation = useDisposePatrimonyMutation();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDisposeOpen, setIsDisposeOpen] = useState(false);

  const transferForm = useForm<{ to_sector_id: string; reason: string }>({
    defaultValues: {
      to_sector_id: "none",
      reason: "",
    },
  });
  const disposeForm = useForm<{
    status: Exclude<PatrimonyStatusValue, "active"> | "";
    disposed_reason: string;
    disposed_protocol: string;
    disposed_notes: string;
  }>({
    defaultValues: {
      status: "",
      disposed_reason: "",
      disposed_protocol: "",
      disposed_notes: "",
    },
  });
  const selectedTransferSector = useWatch({
    control: transferForm.control,
    name: "to_sector_id",
  });
  const selectedDisposeStatus = useWatch({
    control: disposeForm.control,
    name: "status",
  });
  const disposeReason = useWatch({
    control: disposeForm.control,
    name: "disposed_reason",
  });

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `view` para visualizar patrimonios.
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
            O modulo de patrimonios depende da subunidade ativa para carregar o registro.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (patrimonyQuery.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (patrimonyQuery.isError || !patrimonyQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar patrimonio</CardTitle>
          <CardDescription>
            Os dados do patrimonio nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const patrimony = patrimonyQuery.data.data;
  const canOperate = patrimony.status?.value === "active";

  async function handleTransfer(values: { to_sector_id: string; reason: string }) {
    await transferMutation.mutateAsync({
      id: patrimony.id,
      payload: {
        to_sector_id: Number(values.to_sector_id),
        reason: values.reason.trim() || null,
      },
    });
    setIsTransferOpen(false);
    transferForm.reset({ to_sector_id: "none", reason: "" });
  }

  async function handleDispose(values: {
    status: Exclude<PatrimonyStatusValue, "active"> | "";
    disposed_reason: string;
    disposed_protocol: string;
    disposed_notes: string;
  }) {
    if (!values.status) {
      return;
    }

    await disposeMutation.mutateAsync({
      id: patrimony.id,
      payload: {
        status: values.status,
        disposed_reason: values.disposed_reason.trim(),
        disposed_protocol: values.disposed_protocol.trim() || null,
        disposed_notes: values.disposed_notes.trim() || null,
      },
    });
    setIsDisposeOpen(false);
    disposeForm.reset({
      status: "",
      disposed_reason: "",
      disposed_protocol: "",
      disposed_notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{patrimony.code}</h1>
            <Badge variant={getPatrimonyStatusVariant(patrimony.status?.value)}>
              {patrimony.status?.label || "-"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Tipo: {patrimony.patrimony_type?.name || "Nao informado"} • Setor atual:{" "}
            {patrimony.current_sector?.abbreviation ||
              patrimony.current_sector?.name ||
              "Sem setor"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            {patrimony.description || "Sem descricao detalhada para este patrimonio."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/patrimonies/${patrimony.id}/history`}>
              <History className="mr-2 h-4 w-4" />
              Historico setorial
            </Link>
          </Button>
          {permissions.canTransfer && canOperate ? (
            <Button variant="outline" onClick={() => setIsTransferOpen(true)}>
              <Repeat className="mr-2 h-4 w-4" />
              Transferir
            </Button>
          ) : null}
          {permissions.canDispose && canOperate ? (
            <Button variant="outline" onClick={() => setIsDisposeOpen(true)}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Dar baixa
            </Button>
          ) : null}
          {permissions.canUpdate ? (
            <Button asChild variant="outline">
              <Link href={`/patrimonies/${patrimony.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Resumo patrimonial</CardTitle>
            <CardDescription>
              Identificacao, classificacao e localizacao atual do bem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Landmark className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Codigo</p>
                <p className="text-sm text-slate-700">{patrimony.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPinned className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Setor atual</p>
                <p className="text-sm text-slate-700">
                  {patrimony.current_sector?.abbreviation ||
                    patrimony.current_sector?.name ||
                    "Sem setor"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Serie e tipo</p>
              <p className="mt-1 text-sm text-slate-700">
                Serie: {patrimony.serial_number || "-"}
              </p>
              <p className="text-sm text-slate-700">
                Tipo: {patrimony.patrimony_type?.name || "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Aquisicao e auditoria</CardTitle>
            <CardDescription>
              Dados de compra, fornecedor e acompanhamento do registro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Aquisicao</p>
              <p className="mt-1 text-sm text-slate-700">
                Data: {formatDate(patrimony.acquisition_date)}
              </p>
              <p className="text-sm text-slate-700">
                Valor: {formatCurrency(patrimony.acquisition_value)}
              </p>
              <p className="text-sm text-slate-700">
                Fornecedor: {patrimony.supplier || "-"}
              </p>
              <p className="text-sm text-slate-700">
                Nota fiscal: {patrimony.invoice_number || "-"}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {patrimony.creator
                    ? `${patrimony.creator.name} (${patrimony.creator.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {patrimony.updater
                    ? `${patrimony.updater.name} (${patrimony.updater.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Timestamps</p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {formatDateTime(patrimony.created_at)}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {formatDateTime(patrimony.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Baixa</CardTitle>
          <CardDescription>
            Informacoes preenchidas quando o patrimonio foi devolvido ao Estado ou inutilizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Momento da baixa</p>
            <p className="mt-1 text-sm text-slate-700">{formatDateTime(patrimony.disposed_at)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Protocolo</p>
            <p className="mt-1 text-sm text-slate-700">{patrimony.disposed_protocol || "-"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Motivo</p>
            <p className="mt-1 text-sm text-slate-700">{patrimony.disposed_reason || "-"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Observacoes</p>
            <p className="mt-1 text-sm text-slate-700">{patrimony.disposed_notes || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Ultimas movimentacoes setoriais</CardTitle>
          <CardDescription>
            Preview do historico vinculado a esse patrimonio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyPreviewQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !historyPreviewQuery.data?.data.length ? (
            <p className="text-sm text-slate-500">Nenhuma movimentacao setorial encontrada.</p>
          ) : (
            <div className="space-y-3">
              {historyPreviewQuery.data.data.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm text-slate-700">
                    {item.from_sector?.name || "Alocacao inicial"} {"->"}{" "}
                    {item.to_sector?.name || "Sem destino"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDateTime(item.transferred_at)} • {item.reason || "Sem motivo informado"}
                  </p>
                </div>
              ))}
              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href={`/patrimonies/${patrimony.id}/history`}>
                    <History className="mr-2 h-4 w-4" />
                    Abrir historico completo
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir patrimonio</DialogTitle>
            <DialogDescription>
              Escolha o setor de destino para registrar uma nova movimentacao setorial.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={transferForm.handleSubmit(handleTransfer)}
          >
            <div className="space-y-2">
              <Label>Setor de destino</Label>
              <Select
                value={selectedTransferSector || "none"}
                onValueChange={(value) =>
                  transferForm.setValue("to_sector_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o setor</SelectItem>
                  {(sectorsQuery.data?.data ?? [])
                    .filter((sector) => sector.id !== patrimony.current_sector?.id)
                    .map((sector) => (
                      <SelectItem key={sector.id} value={String(sector.id)}>
                        {sector.abbreviation
                          ? `${sector.abbreviation} • ${sector.name}`
                          : sector.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patrimony-transfer-reason">Motivo</Label>
              <Textarea
                id="patrimony-transfer-reason"
                rows={4}
                {...transferForm.register("reason")}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsTransferOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  transferMutation.isPending || !selectedTransferSector || selectedTransferSector === "none"
                }
              >
                {transferMutation.isPending ? "Transferindo..." : "Confirmar transferencia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDisposeOpen} onOpenChange={setIsDisposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar baixa no patrimonio</DialogTitle>
            <DialogDescription>
              Registre a devolucao ao Estado ou a inutilizacao do bem patrimonial.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={disposeForm.handleSubmit(handleDispose)}
          >
            <div className="space-y-2">
              <Label>Status de baixa</Label>
              <Select
                value={selectedDisposeStatus || "none"}
                onValueChange={(value) =>
                  disposeForm.setValue(
                    "status",
                    (value === "none" ? "" : value) as Exclude<PatrimonyStatusValue, "active"> | "",
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o status</SelectItem>
                  {patrimonyDisposeStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patrimony-disposed-reason">Motivo</Label>
              <Textarea
                id="patrimony-disposed-reason"
                rows={4}
                {...disposeForm.register("disposed_reason")}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patrimony-disposed-protocol">Protocolo</Label>
                <Input
                  id="patrimony-disposed-protocol"
                  {...disposeForm.register("disposed_protocol")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patrimony-disposed-notes">Observacoes</Label>
                <Input
                  id="patrimony-disposed-notes"
                  {...disposeForm.register("disposed_notes")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDisposeOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  disposeMutation.isPending ||
                  !selectedDisposeStatus ||
                  !disposeReason?.trim()
                }
              >
                {disposeMutation.isPending ? "Processando..." : "Confirmar baixa"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
