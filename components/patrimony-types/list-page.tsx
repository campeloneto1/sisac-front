"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Landmark, Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePatrimonyTypes } from "@/hooks/use-patrimony-types";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { PatrimonyTypesFilters } from "@/components/patrimony-types/filters";
import { PatrimonyTypesTable } from "@/components/patrimony-types/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function PatrimonyTypesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("patrimony-types");
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

  const patrimonyTypesQuery = usePatrimonyTypes(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `patrimony-types.viewAny` para
            visualizar tipos de patrimônio.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Tipos de patrimônio
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie a classificação administrativa global usada pelos
              patrimônios do sistema.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/patrimony-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <PatrimonyTypesFilters
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

      {patrimonyTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : patrimonyTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de patrimônio</CardTitle>
            <CardDescription>
              Verifique a API e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !patrimonyTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo encontrado</CardTitle>
            <CardDescription>
              Crie um novo tipo ou refine a busca aplicada.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PatrimonyTypesTable patrimonyTypes={patrimonyTypesQuery.data.data} />
          <Pagination
            currentPage={patrimonyTypesQuery.data.meta.current_page}
            lastPage={patrimonyTypesQuery.data.meta.last_page}
            total={patrimonyTypesQuery.data.meta.total}
            from={patrimonyTypesQuery.data.meta.from}
            to={patrimonyTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={patrimonyTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
