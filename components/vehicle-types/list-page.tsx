"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Car, Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useVehicleTypes } from "@/hooks/use-vehicle-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTypesFilters } from "@/components/vehicle-types/filters";
import { VehicleTypesTable } from "@/components/vehicle-types/table";

export function VehicleTypesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("vehicle-types");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
    }),
    [page, search],
  );

  const vehicleTypesQuery = useVehicleTypes(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `vehicle-types.viewAny` para
            visualizar tipos de veículo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">
                Tipos de veículo
              </h1>
              <p className="text-sm text-slate-500">
                Gerencie a classificação administrativa usada pelos veículos do
                sistema.
              </p>
            </div>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleTypesFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPage(1);
        }}
      />

      {vehicleTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : vehicleTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de veículo</CardTitle>
            <CardDescription>
              Verifique a API e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !vehicleTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo encontrado</CardTitle>
            <CardDescription>
              Crie um novo tipo ou refine a busca aplicada.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleTypesTable vehicleTypes={vehicleTypesQuery.data.data} />
          <Pagination
            currentPage={vehicleTypesQuery.data.meta.current_page}
            lastPage={vehicleTypesQuery.data.meta.last_page}
            total={vehicleTypesQuery.data.meta.total}
            from={vehicleTypesQuery.data.meta.from}
            to={vehicleTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={vehicleTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
