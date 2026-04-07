"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CarFront, Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleCustodies } from "@/hooks/use-vehicle-custodies";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  VehicleCustodyCustodianType,
  VehicleCustodyFilters,
  VehicleCustodyStatus,
} from "@/types/vehicle-custody.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCustodiesFilters } from "@/components/vehicle-custodies/filters";
import { VehicleCustodiesTable } from "@/components/vehicle-custodies/table";

export function VehicleCustodiesListPage() {
  const permissions = usePermissions("vehicle-custodies");
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [status, setStatus] = useState("all");
  const [custodianType, setCustodianType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleCustodyFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : null,
      status: status !== "all" ? (status as VehicleCustodyStatus) : undefined,
      custodian_type:
        custodianType !== "all"
          ? (custodianType as VehicleCustodyCustodianType)
          : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [custodianType, endDate, page, search, startDate, status, vehicleId],
  );

  const custodiesQuery = useVehicleCustodies(filters);
  const vehiclesQuery = useVehicles({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar cautelas de
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
            <CarFront className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Cautelas de veiculos
            </h1>
            <p className="text-sm text-slate-500">
              Controle custodias ativas, encerradas ou canceladas da frota.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-custodies/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova cautela
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleCustodiesFilters
        search={search}
        vehicleId={vehicleId}
        status={status}
        custodianType={custodianType}
        startDate={startDate}
        endDate={endDate}
        vehicles={vehiclesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onVehicleChange={(value) => {
          setVehicleId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCustodianTypeChange={(value) => {
          setCustodianType(value);
          setPage(1);
        }}
        onStartDateChange={(value) => {
          setStartDate(value);
          setPage(1);
        }}
        onEndDateChange={(value) => {
          setEndDate(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setVehicleId("all");
          setStatus("all");
          setCustodianType("all");
          setStartDate("");
          setEndDate("");
          setPage(1);
        }}
      />

      {custodiesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : custodiesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar cautelas</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !custodiesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma cautela encontrada</CardTitle>
            <CardDescription>
              Crie uma nova cautela ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleCustodiesTable custodies={custodiesQuery.data.data} />
          <Pagination
            currentPage={custodiesQuery.data.meta.current_page}
            lastPage={custodiesQuery.data.meta.last_page}
            total={custodiesQuery.data.meta.total}
            from={custodiesQuery.data.meta.from}
            to={custodiesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={custodiesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
