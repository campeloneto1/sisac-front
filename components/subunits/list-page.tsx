"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubunitCities, useSubunits, useSubunitUnits } from "@/hooks/use-subunits";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { SubunitsFilters } from "@/components/subunits/filters";
import { SubunitsTable } from "@/components/subunits/table";

export function SubunitsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("subunits");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState("all");
  const [unitId, setUnitId] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      city_id: cityId === "all" ? undefined : Number(cityId),
      unit_id: unitId === "all" ? undefined : Number(unitId),
    }),
    [cityId, page, search, unitId],
  );
  const subunitsQuery = useSubunits(filters);
  const citiesQuery = useSubunitCities();
  const unitsQuery = useSubunitUnits();

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `subunits.viewAny` para visualizar subunidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Subunidades</h1>
          <p className="text-sm text-slate-500">Gerencie subunidades administrativas, seus vínculos territoriais e a cadeia de comando principal.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/subunits/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova subunidade
            </Link>
          </Button>
        ) : null}
      </div>

      <SubunitsFilters
        search={search}
        cityId={cityId}
        unitId={unitId}
        cities={citiesQuery.data?.data ?? []}
        units={unitsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCityChange={(value) => {
          setCityId(value);
          setPage(1);
        }}
        onUnitChange={(value) => {
          setUnitId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCityId("all");
          setUnitId("all");
          setPage(1);
        }}
      />

      {subunitsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : subunitsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar subunidades</CardTitle>
            <CardDescription>Verifique a API, as permissões e o acesso aos cadastros auxiliares.</CardDescription>
          </CardHeader>
        </Card>
      ) : !subunitsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma subunidade encontrada</CardTitle>
            <CardDescription>Crie uma nova subunidade ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <SubunitsTable subunits={subunitsQuery.data.data} />
          <Pagination
            currentPage={subunitsQuery.data.meta.current_page}
            lastPage={subunitsQuery.data.meta.last_page}
            total={subunitsQuery.data.meta.total}
            from={subunitsQuery.data.meta.from}
            to={subunitsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={subunitsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
