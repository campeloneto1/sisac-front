"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BriefcaseBusiness, Plus } from "lucide-react";

import { useCompanies } from "@/hooks/use-companies";
import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleRentals } from "@/hooks/use-vehicle-rentals";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  VehicleRentalFilters,
  VehicleRentalStatus,
} from "@/types/vehicle-rental.type";
import { VehicleRentalsFilters } from "@/components/vehicle-rentals/filters";
import { VehicleRentalsTable } from "@/components/vehicle-rentals/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleRentalsListPage() {
  const permissions = usePermissions("vehicle-rentals");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [vehicleId, setVehicleId] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleRentalFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      status: status !== "all" ? (status as VehicleRentalStatus) : undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : null,
      company_id: companyId !== "all" ? Number(companyId) : null,
    }),
    [companyId, page, search, status, vehicleId],
  );

  const rentalsQuery = useVehicleRentals(filters);
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const companiesQuery = useCompanies({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar locações de
            veículos.
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
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Locações de veículos
            </h1>
            <p className="text-sm text-slate-500">
              Controle contratos, custos e devolucoes de veículos alugados.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-rentals/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova locação
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleRentalsFilters
        search={search}
        status={status}
        vehicleId={vehicleId}
        companyId={companyId}
        vehicles={vehiclesQuery.data?.data ?? []}
        companies={companiesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onVehicleChange={(value) => {
          setVehicleId(value);
          setPage(1);
        }}
        onCompanyChange={(value) => {
          setCompanyId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setVehicleId("all");
          setCompanyId("all");
          setPage(1);
        }}
      />

      {rentalsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : rentalsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar locações</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !rentalsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma locação encontrada</CardTitle>
            <CardDescription>
              Crie uma nova locação ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleRentalsTable rentals={rentalsQuery.data.data} />
          <Pagination
            currentPage={rentalsQuery.data.meta.current_page}
            lastPage={rentalsQuery.data.meta.last_page}
            total={rentalsQuery.data.meta.total}
            from={rentalsQuery.data.meta.from}
            to={rentalsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={rentalsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
