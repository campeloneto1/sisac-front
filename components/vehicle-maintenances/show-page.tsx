"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, CarFront, Cog, Receipt, Wrench } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleMaintenance } from "@/hooks/use-vehicle-maintenances";
import { getVehicleMaintenanceStatusVariant } from "@/types/vehicle-maintenance.type";
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
  return date ? date.slice(0, 10) : "Não informado";
}

function formatCurrency(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "Não informado";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function VehicleMaintenanceShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-maintenances");
  const maintenanceQuery = useVehicleMaintenance(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar manutencoes de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (maintenanceQuery.isLoading) {
    return <Skeleton className="h-[620px] w-full" />;
  }

  if (maintenanceQuery.isError || !maintenanceQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar manutenção</CardTitle>
          <CardDescription>
            Os dados da manutenção não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const maintenance = maintenanceQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {maintenance.vehicle?.license_plate ??
                `Manutenção #${maintenance.id}`}
            </h1>
            <Badge
              variant={getVehicleMaintenanceStatusVariant(maintenance.status)}
            >
              {maintenance.status_label ?? "Sem status"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {maintenance.maintenance_type_label ?? "Tipo não informado"} •
            Entrada em {formatDate(maintenance.entry_date)}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/vehicle-maintenances/${maintenance.id}/edit`}>
              Editar
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Veículo e oficina</CardTitle>
            <CardDescription>Contexto principal da manutenção.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CarFront className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Veículo
                </p>
                <p className="text-sm text-slate-700">
                  {maintenance.vehicle?.license_plate ??
                    `#${maintenance.vehicle_id}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Wrench className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Oficina
                </p>
                <p className="text-sm text-slate-700">
                  {maintenance.workshop?.name ?? "Não informada"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Descrição
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {maintenance.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Entrada e saida</CardTitle>
            <CardDescription>
              Datas, horarios e quilometragens registradas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Entrada
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(maintenance.entry_date)}
                  {maintenance.entry_time ? ` • ${maintenance.entry_time}` : ""}
                </p>
                <p className="text-sm text-slate-500">
                  {maintenance.entry_km} km
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Saida
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(maintenance.exit_date)}
                  {maintenance.exit_time ? ` • ${maintenance.exit_time}` : ""}
                </p>
                <p className="text-sm text-slate-500">
                  {maintenance.exit_km ?? "Não informado"} km
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Previsao de conclusão
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(maintenance.expected_completion_date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Custos</CardTitle>
            <CardDescription>
              Valores consolidados e por categoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Receipt className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Total
                </p>
                <p className="text-sm text-slate-700">
                  {formatCurrency(maintenance.cost)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Pecas
              </p>
              <p className="text-sm text-slate-700">
                {formatCurrency(maintenance.parts_cost)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Mao de obra
              </p>
              <p className="text-sm text-slate-700">
                {formatCurrency(maintenance.labor_cost)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Pecas e observações</CardTitle>
            <CardDescription>
              Itens substituidos e anotacoes operacionais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Pecas substituidas
              </p>
              {maintenance.replaced_parts?.length ? (
                <div className="mt-3 space-y-2">
                  {maintenance.replaced_parts.map((part, index) => (
                    <div
                      key={`${part.part}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <span>
                        {part.part} • {part.quantity} un.
                      </span>
                      <span>{formatCurrency(part.cost)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-700">
                  Nenhuma peça registrada.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Cog className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Observações
                </p>
                <p className="text-sm text-slate-700">
                  {maintenance.notes ?? "Nenhuma observação informada."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
