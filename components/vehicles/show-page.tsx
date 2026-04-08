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
import { useVehicleCustodies } from "@/hooks/use-vehicle-custodies";
import { useVehicleLoans } from "@/hooks/use-vehicle-loans";
import { useVehicleMaintenances } from "@/hooks/use-vehicle-maintenances";
import { useVehicle } from "@/hooks/use-vehicles";
import {
  getVehicleCustodyCustodianLabel,
  getVehicleCustodyStatusVariant,
} from "@/types/vehicle-custody.type";
import {
  getVehicleLoanBorrowerLabel,
  getVehicleLoanStatusVariant,
} from "@/types/vehicle-loan.type";
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

function formatLoanDateTime(date?: string | null, time?: string | null) {
  if (!date) {
    return "-";
  }

  return `${date.slice(0, 10)}${time ? ` • ${time.slice(0, 5)}` : ""}`;
}

export function VehicleShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("vehicles");
  const custodyPermissions = usePermissions("vehicle-custodies");
  const loanPermissions = usePermissions("vehicle-loans");
  const maintenancePermissions = usePermissions("vehicle-maintenances");
  const vehicleQuery = useVehicle(params.id);
  const custodiesQuery = useVehicleCustodies({
    vehicle_id: Number(params.id),
    per_page: 50,
  });
  const loansQuery = useVehicleLoans({
    vehicle_id: Number(params.id),
    per_page: 50,
  });
  const maintenancesQuery = useVehicleMaintenances({
    vehicle_id: Number(params.id),
    per_page: 50,
  });

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar veículos.
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
          <CardTitle>Erro ao carregar veículo</CardTitle>
          <CardDescription>
            Os dados do veículo não estão disponíveis no momento.
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
              {vehicle.is_available ? "Disponível" : "Indisponivel"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {vehicle.vehicle_type?.name ?? "Tipo não informado"} •{" "}
            {vehicle.variant?.name ?? "Modelo não informado"} •{" "}
            {vehicle.subunit?.abbreviation ??
              vehicle.subunit?.name ??
              "Sem subunidade"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Visao consolidada do cadastro operacional, identificadores, estado
            atual e vínculos administrativos do veículo.
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
            <CardTitle>Identificação e operação</CardTitle>
            <CardDescription>
              Dados essenciais do veículo e contexto de uso.
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
                  {vehicle.special_plate ?? "Não informada"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  RENAVAM
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.renavam ?? "Não informado"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Chassis
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.chassis ?? "Não informado"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Posse
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.ownership_type_label ?? "Não informada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Car className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Classificação
                </p>
                <p className="text-sm text-slate-700">
                  {vehicle.vehicle_type?.name ?? "Tipo não informado"} •{" "}
                  {vehicle.variant?.brand?.name
                    ? `${vehicle.variant.brand.name} • `
                    : ""}
                  {vehicle.variant?.name ?? "Modelo não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Quilometragem e controle</CardTitle>
            <CardDescription>
              Indicadores de uso, manutenção e disponibilidade.
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
                  {vehicle.oil_change_km?.toLocaleString("pt-BR") ?? "Não informada"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Revisao por KM
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.revision_km?.toLocaleString("pt-BR") ?? "Não informada"}
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
                      : "Não informada"}
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
                      : "Não informada"}
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
                  {vehicle.is_armored ? "Sim" : "Não"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Organico
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.is_organic ? "Sim" : "Não"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Disponível para viagem
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {vehicle.is_available_for_trip ? "Sim" : "Não"}
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
              Responsável, subunidade e vinculacoes administrativas.
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
                  : vehicle.subunit?.name ?? "Não informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Cor
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {vehicle.color?.name ?? "Não informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Responsável atual
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {vehicle.assigned_to
                  ? `${vehicle.assigned_to.name} (${vehicle.assigned_to.email})`
                  : "Não atribuido"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Observações
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {vehicle.notes || "Não informadas"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Histórico básico de criação e última atualização.
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
                    : "Não informado"}
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
                    : "Não informado"}
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
                  {vehicle.is_assigned ? "Atribuido" : "Não atribuido"} •{" "}
                  {vehicle.is_available ? "Disponível" : "Indisponivel"}
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

      {custodyPermissions.canViewAny ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Histórico de cautelas</CardTitle>
            <CardDescription>
              Relacao das cautelas registradas para este veículo, com dados
              gerais de responsável, período e kilometragem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {custodiesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : custodiesQuery.isError ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-700">
                  Não foi possível carregar o histórico de cautelas deste
                  veículo agora.
                </p>
              </div>
            ) : !custodiesQuery.data?.data.length ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-700">
                  Nenhuma cautela foi registrada para este veículo ate o
                  momento.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Responsável</th>
                        <th className="px-4 py-3 font-medium">Início</th>
                        <th className="px-4 py-3 font-medium">Devolução</th>
                        <th className="px-4 py-3 font-medium">Documento</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Detalhe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {custodiesQuery.data.data.map((custody) => (
                        <tr
                          key={custody.id}
                          className="border-t border-slate-200/70"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {getVehicleCustodyCustodianLabel(custody)}
                              </p>
                              <p className="mt-1 text-slate-500">
                                {custody.custodian_type ===
                                "App\\Models\\PoliceOfficer"
                                  ? "Policial"
                                  : custody.custodian_type === "App\\Models\\User"
                                    ? "Usuário"
                                    : "Externo"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatLoanDateTime(custody.start_date)}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatLoanDateTime(
                              custody.actual_end_date ?? custody.end_date,
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {custody.document_number ?? "-"}
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={getVehicleCustodyStatusVariant(
                                custody.status,
                              )}
                            >
                              {custody.status_label ?? "Sem status"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/vehicle-custodies/${custody.id}`}>
                                Ver
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {maintenancePermissions.canViewAny ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Histórico de manutencoes</CardTitle>
            <CardDescription>
              Relacao das manutencoes registradas para este veículo, com
              oficina, período, custos e status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {maintenancesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : maintenancesQuery.isError ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-700">
                  Não foi possível carregar o histórico de manutencoes deste
                  veículo agora.
                </p>
              </div>
            ) : !maintenancesQuery.data?.data.length ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-700">
                  Nenhuma manutenção foi registrada para este veículo ate o
                  momento.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tipo</th>
                        <th className="px-4 py-3 font-medium">Entrada</th>
                        <th className="px-4 py-3 font-medium">Saida</th>
                        <th className="px-4 py-3 font-medium">Oficina</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Detalhe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenancesQuery.data.data.map((maintenance) => (
                        <tr
                          key={maintenance.id}
                          className="border-t border-slate-200/70"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {maintenance.maintenance_type_label ?? "-"}
                              </p>
                              <p className="mt-1 text-slate-500">
                                {maintenance.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatLoanDateTime(
                              maintenance.entry_date,
                              maintenance.entry_time,
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatLoanDateTime(
                              maintenance.exit_date,
                              maintenance.exit_time,
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {maintenance.workshop?.name ?? "Não informada"}
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={getVehicleMaintenanceStatusVariant(
                                maintenance.status,
                              )}
                            >
                              {maintenance.status_label ?? "Sem status"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/vehicle-maintenances/${maintenance.id}`}
                              >
                                Ver
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {loanPermissions.canViewAny ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Histórico de empréstimos</CardTitle>
            <CardDescription>
              Relacao dos empréstimos já registrados para este veículo, com
              dados gerais de tomador, período e kilometragem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loansQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : loansQuery.isError ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-700">
                  Não foi possível carregar o histórico de empréstimos deste
                  veículo agora.
                </p>
              </div>
            ) : !loansQuery.data?.data.length ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm text-slate-700">
                  Nenhum empréstimo foi registrado para este veículo ate o
                  momento.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tomador</th>
                        <th className="px-4 py-3 font-medium">Saida</th>
                        <th className="px-4 py-3 font-medium">Devolução</th>
                        <th className="px-4 py-3 font-medium">KM</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Detalhe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loansQuery.data.data.map((loan) => (
                        <tr
                          key={loan.id}
                          className="border-t border-slate-200/70"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {getVehicleLoanBorrowerLabel(loan)}
                              </p>
                              <p className="mt-1 text-slate-500">
                                {loan.borrower_type ===
                                "App\\Models\\PoliceOfficer"
                                  ? "Policial"
                                  : loan.borrower_type === "App\\Models\\User"
                                    ? "Usuário"
                                    : "Externo"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatLoanDateTime(loan.start_date, loan.start_time)}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {formatLoanDateTime(loan.end_date, loan.end_time)}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <p>
                              Início: {loan.start_km.toLocaleString("pt-BR")}
                            </p>
                            <p>
                              Final:{" "}
                              {loan.end_km !== null &&
                              loan.end_km !== undefined
                                ? loan.end_km.toLocaleString("pt-BR")
                                : "-"}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={getVehicleLoanStatusVariant(loan.status)}
                            >
                              {loan.status_label ?? "Sem status"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/vehicle-loans/${loan.id}`}>
                                Ver
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
