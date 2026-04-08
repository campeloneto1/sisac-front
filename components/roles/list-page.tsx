"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { RolesFilters } from "@/components/roles/filters";
import { RolesTable } from "@/components/roles/table";

export function RolesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("roles");
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
  const rolesQuery = useRoles(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            O módulo de perfis fica dentro de Administrador e exige `administrator` + `roles.viewAny`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Perfis</h1>
          <p className="text-sm text-slate-500">Gerencie roles e a matriz de permissões do sistema.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/roles/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo perfil
            </Link>
          </Button>
        ) : null}
      </div>

      <RolesFilters
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

      {rolesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : rolesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar perfis</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !rolesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum perfil encontrado</CardTitle>
            <CardDescription>Crie um novo perfil ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <RolesTable roles={rolesQuery.data.data} />
          <Pagination
            currentPage={rolesQuery.data.meta.current_page}
            lastPage={rolesQuery.data.meta.last_page}
            total={rolesQuery.data.meta.total}
            from={rolesQuery.data.meta.from}
            to={rolesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={rolesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
