"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Car,
  Gauge,
  Shield,
  UserCircle2,
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicle } from "@/hooks/use-vehicles";
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

function getOperationalStatusVariant(status?: string | null) {
  switch (status) {
    case "available":
      return "success";
    case "in_use":
      return "info";
    case "maintenance":
      return "warning";
    case "custody":
      return "secondary";
    case "decommissioned":
      return "danger";
    default:
      return "outline";
  }
}

export function VehicleShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicles");
  const vehicleQuery = useVehicle(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `view` para visualizar veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (vehicleQuery.isLoading) {
    return <Skeleton className="h-[620px] w-full" />;
  }

  if (vehicleQuery.isError || !vehicleQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar veiculo</CardTitle>
          <CardDescription>
            Os dados do veiculo nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const vehicle = vehicleQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {vehicle.license_plate}
            </h1>
            <Badge
              variant={getOperationalStatusVariant(vehicle.operational_status)}
            >
              {vehicle.operational_status_label ?? "Sem status"}
            </Badge>
            <Badge variant={vehicle.is_available ? "success" : "warning"}>
              {vehicle.is_available ? "Disponivel" : "Indisponivel"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {vehicle.vehicle_type?.name ?? "Tipo nao informado"} •{" "}
            {vehicle.variant?.name ?? "Modelo nao informado"} •{" "}
            {vehicle.subunit?.abbreviation ??
              vehicle.subunit?.name ??
              "Sem subunidade"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Visao consolidada do cadastro operacional, identificadores, estado
            atual e vinculos administrativos do veiculo.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/vehicles/${vehicle.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Identificacao e operacao</CardTitle>
            <CardDescription>
              Dados essenciais do veiculo e contexto de uso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Placa
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {vehicle.license_plate}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Placa especial
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.special_plate ?? "Nao informada"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  RENAVAM
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.renavam ?? "Nao informado"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Chassis
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.chassis ?? "Nao informado"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Posse
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.ownership_type_label ?? "Nao informada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Car className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Classificacao
                </p>
                <p className="text-sm text-slate-700">
                  {vehicle.vehicle_type?.name ?? "Tipo nao informado"} •{" "}
                  {vehicle.variant?.brand?.name
                    ? `${vehicle.variant.brand.name} • `
                    : ""}
                  {vehicle.variant?.name ?? "Modelo nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Quilometragem e controle</CardTitle>
            <CardDescription>
              Indicadores de uso, manutencao e disponibilidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Gauge className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Quilometragem
                </p>
                <p className="text-sm text-slate-700">
                  Atual: {vehicle.current_km.toLocaleString("pt-BR")} • Inicial:{" "}
                  {vehicle.initial_km.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Troca de oleo
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.oil_change_km?.toLocaleString("pt-BR") ?? "Nao informada"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Revisao por KM
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.revision_km?.toLocaleString("pt-BR") ?? "Nao informada"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Data de revisao
                  </p>
                  <p className="text-sm text-slate-700">
                    {vehicle.revision_date
                      ? vehicle.revision_date.slice(0, 10)
                      : "Nao informada"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Data de baixa
                  </p>
                  <p className="text-sm text-slate-700">
                    {vehicle.decommission_date
                      ? vehicle.decommission_date.slice(0, 10)
                      : "Nao informada"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Blindado
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.is_armored ? "Sim" : "Nao"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Organico
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.is_organic ? "Sim" : "Nao"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Disponivel para viagem
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.is_available_for_trip ? "Sim" : "Nao"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto atual</CardTitle>
            <CardDescription>
              Responsavel, subunidade e vinculacoes administrativas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Subunidade
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {vehicle.subunit?.abbreviation
                  ? `${vehicle.subunit.abbreviation} • ${vehicle.subunit.name}`
                  : vehicle.subunit?.name ?? "Nao informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Cor
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {vehicle.color?.name ?? "Nao informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Responsavel atual
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {vehicle.assigned_to
                  ? `${vehicle.assigned_to.name} (${vehicle.assigned_to.email})`
                  : "Nao atribuido"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observacoes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {vehicle.notes || "Nao informadas"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Historico basico de criacao e ultima atualizacao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {vehicle.creator
                    ? `${vehicle.creator.name} (${vehicle.creator.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Atualizado por
                </p>
                <p className="text-sm text-slate-700">
                  {vehicle.updater
                    ? `${vehicle.updater.name} (${vehicle.updater.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Flags derivadas
                </p>
                <p className="text-sm text-slate-700">
                  {vehicle.is_assigned ? "Atribuido" : "Nao atribuido"} •{" "}
                  {vehicle.is_available ? "Disponivel" : "Indisponivel"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {vehicle.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {vehicle.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
