"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CarFront, Plus } from "lucide-react";

import { useCities } from "@/hooks/use-cities";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubunits } from "@/hooks/use-subunits";
import { useVehicleLoans } from "@/hooks/use-vehicle-loans";
import { useVehicles } from "@/hooks/use-vehicles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleLoansFilters } from "@/components/vehicle-loans/filters";
import { VehicleLoansTable } from "@/components/vehicle-loans/table";

export function VehicleLoansListPage() {
  const permissions = usePermissions("vehicle-loans");
  const [vehicleId, setVehicleId] = useState("all");
  const [status, setStatus] = useState("all");
  const [borrowerType, setBorrowerType] = useState("all");
  const [externalBorrowerName, setExternalBorrowerName] = useState("");
  const [cityId, setCityId] = useState("all");
  const [subunitId, setSubunitId] = useState("all");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : null,
      status: status !== "all" ? status : undefined,
      borrower_type: borrowerType !== "all" ? borrowerType : undefined,
      external_borrower_name: externalBorrowerName || undefined,
      city_id: cityId !== "all" ? Number(cityId) : null,
      subunit_id: subunitId !== "all" ? Number(subunitId) : null,
      start_date_from: startDateFrom || undefined,
      start_date_to: startDateTo || undefined,
    }),
    [
      borrowerType,
      cityId,
      externalBorrowerName,
      page,
      startDateFrom,
      startDateTo,
      status,
      subunitId,
      vehicleId,
    ],
  );

  const loansQuery = useVehicleLoans(filters);
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const citiesQuery = useCities({ per_page: 100 });
  const subunitsQuery = useSubunits({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar emprestimos de
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
              Emprestimos de veiculos
            </h1>
            <p className="text-sm text-slate-500">
              Controle as saidas e devolucoes da frota por veiculo e tomador.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-loans/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo emprestimo
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleLoansFilters
        vehicleId={vehicleId}
        status={status}
        borrowerType={borrowerType}
        externalBorrowerName={externalBorrowerName}
        cityId={cityId}
        subunitId={subunitId}
        startDateFrom={startDateFrom}
        startDateTo={startDateTo}
        vehicles={vehiclesQuery.data?.data ?? []}
        cities={citiesQuery.data?.data ?? []}
        subunits={subunitsQuery.data?.data ?? []}
        onVehicleChange={(value) => {
          setVehicleId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onBorrowerTypeChange={(value) => {
          setBorrowerType(value);
          setPage(1);
        }}
        onExternalBorrowerNameChange={(value) => {
          setExternalBorrowerName(value);
          setPage(1);
        }}
        onCityChange={(value) => {
          setCityId(value);
          setPage(1);
        }}
        onSubunitChange={(value) => {
          setSubunitId(value);
          setPage(1);
        }}
        onStartDateFromChange={(value) => {
          setStartDateFrom(value);
          setPage(1);
        }}
        onStartDateToChange={(value) => {
          setStartDateTo(value);
          setPage(1);
        }}
        onClear={() => {
          setVehicleId("all");
          setStatus("all");
          setBorrowerType("all");
          setExternalBorrowerName("");
          setCityId("all");
          setSubunitId("all");
          setStartDateFrom("");
          setStartDateTo("");
          setPage(1);
        }}
      />

      {loansQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : loansQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar emprestimos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !loansQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum emprestimo encontrado</CardTitle>
            <CardDescription>
              Crie um novo emprestimo ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleLoansTable loans={loansQuery.data.data} />
          <Pagination
            currentPage={loansQuery.data.meta.current_page}
            lastPage={loansQuery.data.meta.last_page}
            total={loansQuery.data.meta.total}
            from={loansQuery.data.meta.from}
            to={loansQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={loansQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
