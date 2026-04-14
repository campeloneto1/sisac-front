"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CarFront,
  Gauge,
  Receipt,
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleRental } from "@/hooks/use-vehicle-rentals";
import { formatBrazilianDate } from "@/lib/date-formatter";
import { getVehicleRentalStatusVariant } from "@/types/vehicle-rental.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date?: string | null) {
  return date ? formatBrazilianDate(date) : "Não informado";
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function VehicleRentalShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-rentals");
  const rentalQuery = useVehicleRental(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar locações de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (rentalQuery.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (rentalQuery.isError || !rentalQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar locação</CardTitle>
          <CardDescription>
            Os dados da locação não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rental = rentalQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {rental.vehicle?.license_plate ?? `Locação #${rental.id}`}
            </h1>
            <Badge variant={getVehicleRentalStatusVariant(rental.status)}>
              {rental.status_label ?? "Sem status"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {rental.company?.trade_name || rental.company?.name || "Locadora"} •
            Contrato {rental.contract_number ?? " sem número"}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/vehicle-rentals/${rental.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Veículo e locadora</CardTitle>
            <CardDescription>
              Dados principais do vínculo contratual.
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
                  {rental.vehicle?.license_plate ?? `#${rental.vehicle_id}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Locadora
                </p>
                <p className="text-sm text-slate-700">
                  {rental.company?.trade_name || rental.company?.name || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Contrato
                </p>
                <p className="text-sm text-slate-700">
                  {rental.contract_number ?? "Sem número informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Datas</CardTitle>
            <CardDescription>
              Período contratual e período real da locação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Início do contrato
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatDate(rental.contract_start_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Fim do contrato
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatDate(rental.contract_end_date)}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Início real
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(rental.actual_start_date)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Fim real
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(rental.actual_end_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Custos</CardTitle>
            <CardDescription>
              Valores da locação por período de cobranca.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Receipt className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Custo diario
                </p>
                <p className="text-sm text-slate-700">
                  {formatCurrency(rental.daily_cost)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Custo mensal
              </p>
              <p className="text-sm text-slate-700">
                {formatCurrency(rental.monthly_cost)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Quilometragem e observações</CardTitle>
            <CardDescription>
              Controle da entrada, saida e movimentacao com a locadora.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <Gauge className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    KM entrada
                  </p>
                  <p className="text-sm text-slate-700">
                    {rental.entry_km ?? "Não informado"}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  KM saida
                </p>
                <p className="text-sm text-slate-700">
                  {rental.exit_km ?? "Não informado"}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Devolvido para locadora
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(rental.returned_to_company_date)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Retornou da locadora
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(rental.returned_from_company_date)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {rental.notes ?? "Nenhuma observação informada."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
