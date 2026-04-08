"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCompanies } from "@/hooks/use-companies";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CompaniesFilters } from "@/components/companies/filters";
import { CompaniesTable } from "@/components/companies/table";

export function CompaniesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("companies");
  const [search, setSearch] = useState("");
  const [cityId, setCityId] = useState<number | undefined>(undefined);
  const [subunitId, setSubunitId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      city_id: cityId,
      subunit_id: subunitId,
    }),
    [page, search, cityId, subunitId],
  );
  const companiesQuery = useCompanies(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `companies.viewAny` para visualizar empresas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Empresas</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro de empresas do sistema.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/companies/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova empresa
            </Link>
          </Button>
        ) : null}
      </div>

      <CompaniesFilters
        search={search}
        cityId={cityId}
        subunitId={subunitId}
        onSearchChange={(value) => {
          setSearch(value);
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
        onClear={() => {
          setSearch("");
          setCityId(undefined);
          setSubunitId(undefined);
          setPage(1);
        }}
      />

      {companiesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : companiesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar empresas</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !companiesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma empresa encontrada</CardTitle>
            <CardDescription>Crie uma nova empresa ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <CompaniesTable companies={companiesQuery.data.data} />
          <Pagination
            currentPage={companiesQuery.data.meta.current_page}
            lastPage={companiesQuery.data.meta.last_page}
            total={companiesQuery.data.meta.total}
            from={companiesQuery.data.meta.from}
            to={companiesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={companiesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
