"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { usePermissionItems } from "@/hooks/use-permission-resources";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionsFilters } from "@/components/permissions/filters";
import { PermissionsTable } from "@/components/permissions/table";

export function PermissionsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("permissions");
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
  const permissionItemsQuery = usePermissionItems(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            O módulo de permissões fica dentro de Administrador e exige `administrator` + `permissions.viewAny`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Permissões</h1>
          <p className="text-sm text-slate-500">Gerencie os slugs que alimentam o RBAC do sistema.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/permissions/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova permissão
            </Link>
          </Button>
        ) : null}
      </div>

      <PermissionsFilters
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

      {permissionItemsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : permissionItemsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar permissões</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !permissionItemsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma permissão encontrada</CardTitle>
            <CardDescription>Crie uma nova permissão ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PermissionsTable permissionsList={permissionItemsQuery.data.data} />
          <Pagination
            currentPage={permissionItemsQuery.data.meta.current_page}
            lastPage={permissionItemsQuery.data.meta.last_page}
            total={permissionItemsQuery.data.meta.total}
            from={permissionItemsQuery.data.meta.from}
            to={permissionItemsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={permissionItemsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
