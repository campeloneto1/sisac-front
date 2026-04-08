"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  Fuel,
  MapPin,
  Receipt,
  User2,
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleFueling } from "@/hooks/use-vehicle-fuelings";
import {
  getVehicleFuelingContextLabel,
  getVehicleFuelTypeVariant,
} from "@/types/vehicle-fueling.type";
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

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function VehicleFuelingShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicle-fuelings");
  const fuelingQuery = useVehicleFueling(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar abastecimentos de
            veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (fuelingQuery.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  if (fuelingQuery.isError || !fuelingQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar abastecimento</CardTitle>
          <CardDescription>
            Os dados do abastecimento não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const fueling = fuelingQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {fueling.vehicle?.license_plate ?? `Abastecimento #${fueling.id}`}
            </h1>
            <Badge variant={getVehicleFuelTypeVariant(fueling.fuel_type)}>
              {fueling.fuel_type_label ?? fueling.fuel_type}
            </Badge>
            {fueling.is_full_tank ? (
              <Badge variant="secondary">Tanque cheio</Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {getVehicleFuelingContextLabel(fueling)} • {formatDate(fueling.fueling_date)}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/vehicle-fuelings/${fueling.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Veículo e contexto</CardTitle>
            <CardDescription>
              Identificação do veículo e do registro operacional associado.
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
                  {fueling.vehicle?.license_plate ?? `#${fueling.vehicle_id}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Fuel className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Contexto
                </p>
                <p className="text-sm text-slate-700">
                  {getVehicleFuelingContextLabel(fueling)} #{fueling.fuelable_id ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <User2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Responsável
                </p>
                <p className="text-sm text-slate-700">
                  {fueling.fueled_by_user?.name ?? "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Dados do abastecimento</CardTitle>
            <CardDescription>
              Data, hora, quilometragem e volume abastecido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data e hora
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(fueling.fueling_date)}
                  {fueling.fueling_time ? ` • ${fueling.fueling_time}` : ""}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Quilometragem
                </p>
                <p className="mt-1 text-sm text-slate-700">{fueling.km} km</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Combustivel
                </p>
                <p className="text-sm text-slate-700">
                  {fueling.fuel_type_label ?? fueling.fuel_type}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Litros
                </p>
                <p className="text-sm text-slate-700">
                  {fueling.liters.toFixed(2)} L
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Tanque
                </p>
                <p className="text-sm text-slate-700">
                  {fueling.is_full_tank ? "Cheio" : "Parcial"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
            <CardDescription>
              Valores unitarios e custo total do abastecimento.
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
                  {formatCurrency(fueling.total_cost)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Preco por litro
              </p>
              <p className="text-sm text-slate-700">
                {formatCurrency(fueling.price_per_liter ?? null)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Cupom / nota
              </p>
              <p className="text-sm text-slate-700">
                {fueling.invoice_number ?? "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Local e observações</CardTitle>
            <CardDescription>
              Posto, cidade e detalhes complementares do registro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Posto
                </p>
                <p className="text-sm text-slate-700">
                  {fueling.gas_station ?? "Não informado"}
                  {fueling.gas_station_city
                    ? ` • ${fueling.gas_station_city}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado em
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(fueling.created_at)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {fueling.notes ?? "Nenhuma observação informada."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
