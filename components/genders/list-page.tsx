"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useGenders } from "@/hooks/use-genders";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { GendersFilters } from "@/components/genders/filters";
import { GendersTable } from "@/components/genders/table";

export function GendersListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("genders");
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
  const gendersQuery = useGenders(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `genders.viewAny` para visualizar generos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Generos</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro administrativo de generos utilizado por outros modulos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/genders/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo genero
            </Link>
          </Button>
        ) : null}
      </div>

      <GendersFilters
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

      {gendersQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : gendersQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar generos</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !gendersQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum genero encontrado</CardTitle>
            <CardDescription>Crie um novo genero ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <GendersTable genders={gendersQuery.data.data} />
          <Pagination
            currentPage={gendersQuery.data.meta.current_page}
            lastPage={gendersQuery.data.meta.last_page}
            total={gendersQuery.data.meta.total}
            from={gendersQuery.data.meta.from}
            to={gendersQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={gendersQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
