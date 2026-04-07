"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  CarFront,
  Gauge,
  MapPin,
  UserCircle2,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useFinalizeVehicleCustodyMutation } from "@/hooks/use-vehicle-custody-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleCustody } from "@/hooks/use-vehicle-custodies";
import {
  getVehicleCustodyHolderLabel,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const finalizeSchema = z.object({
  end_km: z.coerce.number().int().min(0, "Informe a quilometragem final."),
  return_notes: z
    .string()
    .max(1000, "As observacoes devem ter no maximo 1000 caracteres."),
});

type FinalizeValues = z.output<typeof finalizeSchema>;

function formatDateTime(date?: string | null, time?: string | null) {
  if (!date) {
    return "Nao informado";
  }

  return `${date.slice(0, 10)}${time ? ` • ${time.slice(0, 5)}` : ""}`;
}

export function VehicleCustodyShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-custodies");
  const custodyQuery = useVehicleCustody(params.id);
  const finalizeMutation = useFinalizeVehicleCustodyMutation();
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.input<typeof finalizeSchema>, unknown, FinalizeValues>({
    resolver: zodResolver(finalizeSchema),
    defaultValues: {
      end_km: 0,
      return_notes: "",
    },
  });

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `view` para visualizar cautelas de
            veiculos.
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
            Os dados da cautela nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const custody = custodyQuery.data.data;

  async function onSubmitFinalize(values: FinalizeValues) {
    await finalizeMutation.mutateAsync({
      id: custody.id,
      payload: {
        end_km: values.end_km,
        return_notes: values.return_notes.trim() || null,
      },
    });
    setIsFinalizeDialogOpen(false);
    reset();
  }

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
              {getVehicleCustodyHolderLabel(custody)} • Inicio em{" "}
              {formatDateTime(custody.start_date, custody.start_time)}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Acompanhe os dados do responsavel, a movimentacao do veiculo e o
              fechamento da devolucao.
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
            {permissions.canUpdate && custody.status === "in_use" ? (
              <Button onClick={() => setIsFinalizeDialogOpen(true)}>
                Finalizar cautela
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Veiculo e responsavel</CardTitle>
              <CardDescription>
                Contexto principal da cautela.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <CarFront className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Veiculo
                  </p>
                  <p className="text-sm text-slate-700">
                    {custody.vehicle?.license_plate ?? `#${custody.vehicle_id}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {custody.vehicle?.vehicle_type?.name ?? "Tipo nao informado"}
                    {custody.vehicle?.variant?.name
                      ? ` • ${custody.vehicle.variant.name}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Responsavel
                  </p>
                  <p className="text-sm text-slate-700">
                    {getVehicleCustodyHolderLabel(custody)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {custody.borrower_type === "App\\Models\\PoliceOfficer"
                      ? "Policial"
                      : custody.borrower_type === "App\\Models\\User"
                        ? "Usuario"
                        : "Externo"}
                  </p>
                </div>
              </div>

              {!custody.borrower ? (
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Dados externos
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Documento:{" "}
                    {custody.external_borrower_document ?? "Nao informado"}
                  </p>
                  <p className="text-sm text-slate-700">
                    Telefone:{" "}
                    {custody.external_borrower_phone ?? "Nao informado"}
                  </p>
                </div>
              ) : null}

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Local de referencia
                  </p>
                  <p className="text-sm text-slate-700">
                    {custody.city?.name ?? "Cidade nao informada"}
                    {custody.subunit?.name
                      ? ` • ${custody.subunit.abbreviation ?? custody.subunit.name}`
                      : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Movimentacao</CardTitle>
              <CardDescription>
                Datas, horarios e kilometragem da cautela.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Inicio
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDateTime(custody.start_date, custody.start_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Devolucao
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDateTime(custody.end_date, custody.end_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Gauge className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Quilometragem
                  </p>
                  <p className="text-sm text-slate-700">
                    Inicio: {custody.start_km.toLocaleString("pt-BR")} • Final:{" "}
                    {custody.end_km !== null && custody.end_km !== undefined
                      ? custody.end_km.toLocaleString("pt-BR")
                      : "-"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Percorrido:{" "}
                    {custody.km_traveled !== null &&
                    custody.km_traveled !== undefined
                      ? `${custody.km_traveled.toLocaleString("pt-BR")} km`
                      : "Nao calculado"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Observacoes iniciais
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {custody.start_notes ?? "Nenhuma observacao registrada."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Observacoes de devolucao
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {custody.return_notes ?? "Nenhuma observacao registrada."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Historico basico de criacao e ultima atualizacao.
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
                  : "Nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Atualizado por
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {custody.updater
                  ? `${custody.updater.name} (${custody.updater.email})`
                  : "Nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {custody.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {custody.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isFinalizeDialogOpen}
        onOpenChange={setIsFinalizeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar cautela</DialogTitle>
            <DialogDescription>
              Informe os dados finais para encerrar essa cautela e devolver o
              veiculo ao fluxo operacional.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => void onSubmitFinalize(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="end_km">KM final</Label>
              <Input id="end_km" type="number" min={0} {...register("end_km")} />
              {errors.end_km ? (
                <p className="text-sm text-destructive">
                  {errors.end_km.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_notes">Observacoes finais</Label>
              <Textarea
                id="return_notes"
                placeholder="Descreva o retorno do veiculo e observacoes finais."
                {...register("return_notes")}
              />
              {errors.return_notes ? (
                <p className="text-sm text-destructive">
                  {errors.return_notes.message}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFinalizeDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={finalizeMutation.isPending}>
                {finalizeMutation.isPending
                  ? "Finalizando..."
                  : "Confirmar devolucao"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
