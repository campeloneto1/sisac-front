"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Shapes } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useMaterialTypes } from "@/hooks/use-material-types";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialTypesFilters } from "@/components/material-types/filters";
import { MaterialTypesTable } from "@/components/material-types/table";

export function MaterialTypesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("material-types");
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

  const materialTypesQuery = useMaterialTypes(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `material-types.viewAny` para
            visualizar tipos de material.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
              <Shapes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">
                Tipos de material
              </h1>
              <p className="text-sm text-slate-500">
                Gerencie a classificacao administrativa global usada pelos
                materiais do sistema.
              </p>
            </div>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/material-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <MaterialTypesFilters
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

      {materialTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : materialTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de material</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !materialTypesQuery.data?.data.length ? (
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
          <MaterialTypesTable materialTypes={materialTypesQuery.data.data} />
          <Pagination
            currentPage={materialTypesQuery.data.meta.current_page}
            lastPage={materialTypesQuery.data.meta.last_page}
            total={materialTypesQuery.data.meta.total}
            from={materialTypesQuery.data.meta.from}
            to={materialTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={materialTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
