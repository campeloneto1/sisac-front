"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useUnitCities, useUnits } from "@/hooks/use-units";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitsFilters } from "@/components/units/filters";
import { UnitsTable } from "@/components/units/table";

export function UnitsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("units");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      city_id: cityId === "all" ? undefined : Number(cityId),
    }),
    [cityId, page, search],
  );
  const unitsQuery = useUnits(filters);
  const citiesQuery = useUnitCities();

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `units.viewAny` para visualizar unidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Unidades</h1>
          <p className="text-sm text-slate-500">Gerencie unidades administrativas, suas cidades e a cadeia de comando principal.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/units/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova unidade
            </Link>
          </Button>
        ) : null}
      </div>

      <UnitsFilters
        search={search}
        cityId={cityId}
        cities={citiesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCityChange={(value) => {
          setCityId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCityId("all");
          setPage(1);
        }}
      />

      {unitsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : unitsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar unidades</CardTitle>
            <CardDescription>Verifique a API, as permissoes e o acesso aos cadastros auxiliares.</CardDescription>
          </CardHeader>
        </Card>
      ) : !unitsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma unidade encontrada</CardTitle>
            <CardDescription>Crie uma nova unidade ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <UnitsTable units={unitsQuery.data.data} />
          <Pagination
            currentPage={unitsQuery.data.meta.current_page}
            lastPage={unitsQuery.data.meta.last_page}
            total={unitsQuery.data.meta.total}
            from={unitsQuery.data.meta.from}
            to={unitsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={unitsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
