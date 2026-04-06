"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCountries } from "@/hooks/use-countries";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CountriesFilters } from "@/components/countries/filters";
import { CountriesTable } from "@/components/countries/table";

export function CountriesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("countries");
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
  const countriesQuery = useCountries(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `countries.viewAny` para visualizar paises.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Paises</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro administrativo de paises usado por outros modulos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/countries/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo pais
            </Link>
          </Button>
        ) : null}
      </div>

      <CountriesFilters
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

      {countriesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : countriesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar paises</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !countriesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum pais encontrado</CardTitle>
            <CardDescription>Crie um novo pais ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <CountriesTable countries={countriesQuery.data.data} />
          <Pagination
            currentPage={countriesQuery.data.meta.current_page}
            lastPage={countriesQuery.data.meta.last_page}
            total={countriesQuery.data.meta.total}
            from={countriesQuery.data.meta.from}
            to={countriesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={countriesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
