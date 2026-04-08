"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCities, useCityStates } from "@/hooks/use-cities";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CitiesFilters } from "@/components/cities/filters";
import { CitiesTable } from "@/components/cities/table";

export function CitiesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("cities");
  const [search, setSearch] = useState("");
  const [stateId, setStateId] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      state_id: stateId === "all" ? undefined : Number(stateId),
    }),
    [page, search, stateId],
  );
  const citiesQuery = useCities(filters);
  const statesQuery = useCityStates();

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `cities.viewAny` para visualizar cidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Cidades</h1>
          <p className="text-sm text-slate-500">Gerencie cidades do cadastro administrativo e seus vínculos territoriais.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/cities/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova cidade
            </Link>
          </Button>
        ) : null}
      </div>

      <CitiesFilters
        search={search}
        stateId={stateId}
        states={statesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStateChange={(value) => {
          setStateId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStateId("all");
          setPage(1);
        }}
      />

      {citiesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : citiesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar cidades</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !citiesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma cidade encontrada</CardTitle>
            <CardDescription>Crie uma nova cidade ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <CitiesTable cities={citiesQuery.data.data} />
          <Pagination
            currentPage={citiesQuery.data.meta.current_page}
            lastPage={citiesQuery.data.meta.last_page}
            total={citiesQuery.data.meta.total}
            from={citiesQuery.data.meta.from}
            to={citiesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={citiesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
