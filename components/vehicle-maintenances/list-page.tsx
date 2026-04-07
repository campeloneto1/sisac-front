"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Wrench } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleMaintenances } from "@/hooks/use-vehicle-maintenances";
import { useVehicles } from "@/hooks/use-vehicles";
import { useWorkshops } from "@/hooks/use-workshops";
import type {
  VehicleMaintenanceFilters,
  VehicleMaintenanceStatus,
  VehicleMaintenanceType,
} from "@/types/vehicle-maintenance.type";
import { VehicleMaintenancesFilters } from "@/components/vehicle-maintenances/filters";
import { VehicleMaintenancesTable } from "@/components/vehicle-maintenances/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleMaintenancesListPage() {
  const permissions = usePermissions("vehicle-maintenances");
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [workshopId, setWorkshopId] = useState("all");
  const [maintenanceType, setMaintenanceType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleMaintenanceFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : null,
      workshop_id: workshopId !== "all" ? Number(workshopId) : null,
      maintenance_type:
        maintenanceType !== "all"
          ? (maintenanceType as VehicleMaintenanceType)
          : undefined,
      status: status !== "all" ? (status as VehicleMaintenanceStatus) : undefined,
    }),
    [maintenanceType, page, search, status, vehicleId, workshopId],
  );

  const maintenancesQuery = useVehicleMaintenances(filters);
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const workshopsQuery = useWorkshops({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar manutencoes de
            veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Manutencoes de veiculos
            </h1>
            <p className="text-sm text-slate-500">
              Controle entradas em oficina, custos, previsoes e encerramentos.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-maintenances/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova manutencao
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleMaintenancesFilters
        search={search}
        vehicleId={vehicleId}
        workshopId={workshopId}
        maintenanceType={maintenanceType}
        status={status}
        vehicles={vehiclesQuery.data?.data ?? []}
        workshops={workshopsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onVehicleChange={(value) => {
          setVehicleId(value);
          setPage(1);
        }}
        onWorkshopChange={(value) => {
          setWorkshopId(value);
          setPage(1);
        }}
        onMaintenanceTypeChange={(value) => {
          setMaintenanceType(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setVehicleId("all");
          setWorkshopId("all");
          setMaintenanceType("all");
          setStatus("all");
          setPage(1);
        }}
      />

      {maintenancesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : maintenancesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar manutencoes</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !maintenancesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma manutencao encontrada</CardTitle>
            <CardDescription>
              Crie uma nova manutencao ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleMaintenancesTable
            maintenances={maintenancesQuery.data.data}
          />
          <Pagination
            currentPage={maintenancesQuery.data.meta.current_page}
            lastPage={maintenancesQuery.data.meta.last_page}
            total={maintenancesQuery.data.meta.total}
            from={maintenancesQuery.data.meta.from}
            to={maintenancesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={maintenancesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
