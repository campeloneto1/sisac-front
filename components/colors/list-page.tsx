"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Palette, Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useColors } from "@/hooks/use-colors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorsFilters } from "@/components/colors/filters";
import { ColorsTable } from "@/components/colors/table";

export function ColorsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("colors");
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

  const colorsQuery = useColors(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `colors.viewAny` para visualizar
            cores.
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
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">Cores</h1>
              <p className="text-sm text-slate-500">
                Cadastre a paleta administrativa usada por recursos mestres.
              </p>
            </div>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/colors/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova cor
            </Link>
          </Button>
        ) : null}
      </div>

      <ColorsFilters
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

      {colorsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : colorsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar cores</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !colorsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma cor encontrada</CardTitle>
            <CardDescription>
              Crie uma nova cor ou refine a busca aplicada.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ColorsTable colors={colorsQuery.data.data} />
          <Pagination
            currentPage={colorsQuery.data.meta.current_page}
            lastPage={colorsQuery.data.meta.last_page}
            total={colorsQuery.data.meta.total}
            from={colorsQuery.data.meta.from}
            to={colorsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={colorsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
