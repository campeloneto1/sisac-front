"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useRoles, useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersFilters } from "@/components/users/filters";
import { UsersTable } from "@/components/users/table";

export function UsersListPage() {
  const permissions = usePermissions("users");
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("all");
  const filters = useMemo(
    () => ({
      page: 1,
      per_page: 15,
      search: search || undefined,
      role_id: roleId !== "all" ? Number(roleId) : null,
    }),
    [roleId, search],
  );
  const usersQuery = useUsers(filters);
  const rolesQuery = useRoles();

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` para visualizar o menu e a lista de usuarios.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">Gestao completa de usuarios, perfis e acesso administrativo.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/users/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo usuario
            </Link>
          </Button>
        ) : null}
      </div>

      <UsersFilters
        search={search}
        roleId={roleId}
        roles={rolesQuery.data?.data ?? []}
        onSearchChange={setSearch}
        onRoleChange={setRoleId}
        onClear={() => {
          setSearch("");
          setRoleId("all");
        }}
      />

      {usersQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : usersQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar usuarios</CardTitle>
            <CardDescription>Tente novamente em instantes. Se persistir, revise as permissoes e a API.</CardDescription>
          </CardHeader>
        </Card>
      ) : !usersQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum usuario encontrado</CardTitle>
            <CardDescription>Ajuste os filtros ou cadastre um novo usuario.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <UsersTable users={usersQuery.data.data} />
      )}
    </div>
  );
}
