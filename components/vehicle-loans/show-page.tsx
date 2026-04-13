"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CarFront, Gauge, MapPin, UserCircle2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMarkVehicleLoanReturnedMutation } from "@/hooks/use-vehicle-loan-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleLoan } from "@/hooks/use-vehicle-loans";
import {
  getVehicleLoanBorrowerLabel,
  getVehicleLoanStatusVariant,
} from "@/types/vehicle-loan.type";
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

const returnSchema = z.object({
  end_km: z.coerce.number().int().min(0, "Informe a quilometragem final."),
  return_notes: z
    .string()
    .max(1000, "As observações devem ter no máximo 1000 caracteres."),
});

type ReturnValues = z.infer<typeof returnSchema>;

function formatDateTime(date?: string | null, time?: string | null) {
  if (!date) {
    return "Não informado";
  }

  return `${date.slice(0, 10)}${time ? ` • ${time.slice(0, 5)}` : ""}`;
}

export function VehicleLoanShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-loans");
  const loanQuery = useVehicleLoan(params.id);
  const returnMutation = useMarkVehicleLoanReturnedMutation();
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReturnValues>({
    resolver: zodResolver(returnSchema),
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
            Você precisa da permissão `view` para visualizar empréstimos de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loanQuery.isLoading) {
    return <Skeleton className="h-[620px] w-full" />;
  }

  if (loanQuery.isError || !loanQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar empréstimo</CardTitle>
          <CardDescription>
            Os dados do empréstimo não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const loan = loanQuery.data.data;

  async function onSubmitReturn(values: ReturnValues) {
    await returnMutation.mutateAsync({
      id: loan.id,
      payload: {
        end_km: values.end_km,
        return_notes: values.return_notes.trim() || null,
      },
    });
    setIsReturnDialogOpen(false);
    reset();
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-slate-900">
                {loan.vehicle?.license_plate ?? `Empréstimo #${loan.id}`}
              </h1>
              <Badge variant={getVehicleLoanStatusVariant(loan.status)}>
                {loan.status_label ?? "Sem status"}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {getVehicleLoanBorrowerLabel(loan)} • Saida em{" "}
              {formatDateTime(loan.start_date, loan.start_time)}
            </p>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Acompanhe os dados do tomador, a movimentacao do veículo e o
              fechamento da devolução.
            </p>
          </div>

          <div className="flex gap-3">
            {permissions.canUpdate ? (
              <Button asChild variant="outline">
                <Link href={`/vehicle-loans/${loan.id}/edit`}>Editar</Link>
              </Button>
            ) : null}
            {permissions.canUpdate && loan.status === "in_use" ? (
              <Button onClick={() => setIsReturnDialogOpen(true)}>
                Marcar devolução
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Veículo e tomador</CardTitle>
              <CardDescription>
                Contexto principal do empréstimo.
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
                    {loan.vehicle?.license_plate ?? `#${loan.vehicle_id}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {loan.vehicle?.vehicle_type?.name ?? "Tipo não informado"}
                    {loan.vehicle?.variant?.name
                      ? ` • ${loan.vehicle.variant.name}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <UserCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Tomador
                  </p>
                  <p className="text-sm text-slate-700">
                    {getVehicleLoanBorrowerLabel(loan)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {loan.borrower_type === "App\\Models\\PoliceOfficer"
                      ? "Policial"
                      : "Usuário"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Local de referência
                  </p>
                  <p className="text-sm text-slate-700">
                    {loan.city?.name ?? "Cidade não informada"}
                    {loan.subunit?.name
                      ? ` • ${loan.subunit.abbreviation ?? loan.subunit.name}`
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
                Datas, horarios e kilometragem do empréstimo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Saida
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDateTime(loan.start_date, loan.start_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Devolução
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDateTime(loan.end_date, loan.end_time)}
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
                    Início: {loan.start_km.toLocaleString("pt-BR")} • Final:{" "}
                    {loan.end_km !== null && loan.end_km !== undefined
                      ? loan.end_km.toLocaleString("pt-BR")
                      : "-"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Percorrido:{" "}
                    {loan.km_traveled !== null && loan.km_traveled !== undefined
                      ? `${loan.km_traveled.toLocaleString("pt-BR")} km`
                      : "Não calculado"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Observações de retirada
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {loan.start_notes ?? "Nenhuma observação registrada."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Observações de devolução
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {loan.return_notes ?? "Nenhuma observação registrada."}
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
                {loan.creator
                  ? `${loan.creator.name} (${loan.creator.email})`
                  : "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Atualizado por
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {loan.updater
                  ? `${loan.updater.name} (${loan.updater.email})`
                  : "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {loan.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {loan.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar devolução</DialogTitle>
            <DialogDescription>
              Informe os dados finais para encerrar esse empréstimo e devolver o
              veículo ao status operacional correspondente.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmitReturn)}>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-700">
                A data e a hora da devolução serao registradas automaticamente
                no momento da confirmacao.
              </p>
            </div>

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
              <Label htmlFor="return_notes">Observações</Label>
              <Textarea
                id="return_notes"
                placeholder="Descreva as condicoes do veículo na devolução."
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
                onClick={() => setIsReturnDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={returnMutation.isPending}>
                {returnMutation.isPending ? "Salvando..." : "Confirmar devolução"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
