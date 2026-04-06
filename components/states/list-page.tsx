"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useStateCountries, useStates } from "@/hooks/use-states";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StatesFilters } from "@/components/states/filters";
import { StatesTable } from "@/components/states/table";

export function StatesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("states");
  const [search, setSearch] = useState("");
  const [countryId, setCountryId] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      country_id: countryId !== "all" ? Number(countryId) : null,
    }),
    [countryId, page, search],
  );
  const statesQuery = useStates(filters);
  const countriesQuery = useStateCountries();

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `states.viewAny` para visualizar estados.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Estados</h1>
          <p className="text-sm text-slate-500">Gerencie estados vinculados a paises dentro do cadastro administrativo.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/states/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo estado
            </Link>
          </Button>
        ) : null}
      </div>

      <StatesFilters
        search={search}
        countryId={countryId}
        countries={countriesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCountryChange={(value) => {
          setCountryId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCountryId("all");
          setPage(1);
        }}
      />

      {statesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : statesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar estados</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !statesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum estado encontrado</CardTitle>
            <CardDescription>Crie um novo estado ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <StatesTable states={statesQuery.data.data} />
          <Pagination
            currentPage={statesQuery.data.meta.current_page}
            lastPage={statesQuery.data.meta.last_page}
            total={statesQuery.data.meta.total}
            from={statesQuery.data.meta.from}
            to={statesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={statesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
