"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CarFront, FileText, UserCircle2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCancelVehicleCustodyMutation,
  useFinalizeVehicleCustodyMutation,
} from "@/hooks/use-vehicle-custody-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleCustody } from "@/hooks/use-vehicle-custodies";
import { formatBrazilianDate } from "@/lib/date-formatter";
import {
  getVehicleCustodyCustodianLabel,
  getVehicleCustodyStatusVariant,
} from "@/types/vehicle-custody.type";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const finalizeSchema = z.object({
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
});

type FinalizeValues = z.output<typeof finalizeSchema>;

function formatDate(date?: string | null) {
  return date ? formatBrazilianDate(date) : "Não informado";
}

export function VehicleCustodyShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-custodies");
  const custodyQuery = useVehicleCustody(params.id);
  const finalizeMutation = useFinalizeVehicleCustodyMutation();
  const cancelMutation = useCancelVehicleCustodyMutation();
  const [action, setAction] = useState<"finalize" | "cancel" | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.input<typeof finalizeSchema>, unknown, FinalizeValues>({
    resolver: zodResolver(finalizeSchema),
    defaultValues: {
      notes: "",
    },
  });

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar cautelas de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (custodyQuery.isLoading) {
    return <Skeleton className="h-[620px] w-full" />;
  }

  if (custodyQuery.isError || !custodyQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar cautela</CardTitle>
          <CardDescription>
            Os dados da cautela não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const custody = custodyQuery.data.data;

  async function onSubmitAction(values: FinalizeValues) {
    if (action === "finalize") {
      await finalizeMutation.mutateAsync({
        id: custody.id,
        payload: {
          notes: values.notes.trim() || null,
        },
      });
    }

    if (action === "cancel") {
      await cancelMutation.mutateAsync({
        id: custody.id,
        payload: {
          reason: values.notes.trim() || null,
        },
      });
    }

    setAction(null);
    reset();
  }

  const isPending = finalizeMutation.isPending || cancelMutation.isPending;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-slate-900">
                {custody.vehicle?.license_plate ?? `Cautela #${custody.id}`}
              </h1>
              <Badge variant={getVehicleCustodyStatusVariant(custody.status)}>
                {custody.status_label ?? "Sem status"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {getVehicleCustodyCustodianLabel(custody)} • Início em{" "}
              {formatDate(custody.start_date)}
            </p>
          </div>

          <div className="flex gap-3">
            {permissions.canUpdate ? (
              <Button asChild variant="outline">
                <Link href={`/vehicle-custodies/${custody.id}/edit`}>
                  Editar
                </Link>
              </Button>
            ) : null}
            {permissions.canUpdate && custody.status === "active" ? (
              <>
                <Button variant="outline" onClick={() => setAction("cancel")}>
                  Cancelar
                </Button>
                <Button onClick={() => setAction("finalize")}>
                  Encerrar cautela
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Veículo e custodiante</CardTitle>
              <CardDescription>
                Dados principais da cautela.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <CarFront className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Veículo
                  </p>
                  <p className="text-sm text-slate-700">
                    {custody.vehicle?.license_plate ?? `#${custody.vehicle_id}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Custodiante
                  </p>
                  <p className="text-sm text-slate-700">
                    {getVehicleCustodyCustodianLabel(custody)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {custody.custodian_type === "App\\Models\\PoliceOfficer"
                      ? "Policial"
                      : "Usuário"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Documento
                  </p>
                  <p className="text-sm text-slate-700">
                    {custody.document_number ?? "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Período e motivo</CardTitle>
              <CardDescription>
                Datas e justificativas da cautela.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Início
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDate(custody.start_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Fim previsto
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDate(custody.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Fim efetivo
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDate(custody.actual_end_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Motivo
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {custody.reason ?? "Nenhum motivo informado."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Observações
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {custody.notes ?? "Nenhuma observação registrada."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Histórico básico de criação e última atualização.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Criado por
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {custody.creator
                  ? `${custody.creator.name} (${custody.creator.email})`
                  : "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Atualizado por
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {custody.updater
                  ? `${custody.updater.name} (${custody.updater.email})`
                  : "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(action)} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "cancel" ? "Cancelar cautela" : "Encerrar cautela"}
            </DialogTitle>
            <DialogDescription>
              {action === "cancel"
                ? "Informe o motivo do cancelamento da cautela."
                : "Informe observações finais para encerrar a cautela."}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => void onSubmitAction(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="notes">
                {action === "cancel" ? "Motivo" : "Observações finais"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  action === "cancel"
                    ? "Descreva o motivo do cancelamento."
                    : "Descreva o encerramento da cautela."
                }
                {...register("notes")}
              />
              {errors.notes ? (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAction(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Salvando..."
                  : action === "cancel"
                    ? "Confirmar cancelamento"
                    : "Confirmar encerramento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
