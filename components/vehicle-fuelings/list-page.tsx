"use client";

import Link from "next/link";
import { Fuel, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleFuelings } from "@/hooks/use-vehicle-fuelings";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  VehicleFuelType,
  VehicleFuelingFilters,
} from "@/types/vehicle-fueling.type";
import { VehicleFuelingsFilters } from "@/components/vehicle-fuelings/filters";
import { VehicleFuelingsTable } from "@/components/vehicle-fuelings/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleFuelingsListPage() {
  const permissions = usePermissions("vehicle-fuelings");
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [isFullTank, setIsFullTank] = useState("all");
  const [fuelingDateFrom, setFuelingDateFrom] = useState("");
  const [fuelingDateTo, setFuelingDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleFuelingFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : null,
      fuel_type: fuelType !== "all" ? (fuelType as VehicleFuelType) : undefined,
      is_full_tank:
        isFullTank === "all" ? null : isFullTank === "true" ? true : false,
      fueling_date_from: fuelingDateFrom || undefined,
      fueling_date_to: fuelingDateTo || undefined,
    }),
    [fuelType, fuelingDateFrom, fuelingDateTo, isFullTank, page, search, vehicleId],
  );

  const fuelingsQuery = useVehicleFuelings(filters);
  const vehiclesQuery = useVehicles({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar abastecimentos
            de veículos.
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
            <Fuel className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Abastecimentos de veículos
            </h1>
            <p className="text-sm text-slate-500">
              Controle abastecimentos vinculados a empréstimos, cautelas e
              manutencoes.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-fuelings/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo abastecimento
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleFuelingsFilters
        search={search}
        vehicleId={vehicleId}
        fuelType={fuelType}
        isFullTank={isFullTank}
        fuelingDateFrom={fuelingDateFrom}
        fuelingDateTo={fuelingDateTo}
        vehicles={vehiclesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onVehicleChange={(value) => {
          setVehicleId(value);
          setPage(1);
        }}
        onFuelTypeChange={(value) => {
          setFuelType(value);
          setPage(1);
        }}
        onIsFullTankChange={(value) => {
          setIsFullTank(value);
          setPage(1);
        }}
        onFuelingDateFromChange={(value) => {
          setFuelingDateFrom(value);
          setPage(1);
        }}
        onFuelingDateToChange={(value) => {
          setFuelingDateTo(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setVehicleId("all");
          setFuelType("all");
          setIsFullTank("all");
          setFuelingDateFrom("");
          setFuelingDateTo("");
          setPage(1);
        }}
      />

      {fuelingsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : fuelingsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar abastecimentos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !fuelingsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum abastecimento encontrado</CardTitle>
            <CardDescription>
              Registre um novo abastecimento ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleFuelingsTable fuelings={fuelingsQuery.data.data} />
          <Pagination
            currentPage={fuelingsQuery.data.meta.current_page}
            lastPage={fuelingsQuery.data.meta.last_page}
            total={fuelingsQuery.data.meta.total}
            from={fuelingsQuery.data.meta.from}
            to={fuelingsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={fuelingsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
