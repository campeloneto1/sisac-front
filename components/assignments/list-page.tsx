"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useAssignments } from "@/hooks/use-assignments";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentsFilters } from "@/components/assignments/filters";
import { AssignmentsTable } from "@/components/assignments/table";

export function AssignmentsListPage() {
  const permissions = usePermissions("assignments");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      category: category.trim() || undefined,
    }),
    [category, page, search],
  );
  const assignmentsQuery = useAssignments(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar funções e atribuições.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Funções/atribuições</h1>
          <p className="text-sm text-slate-500">Cadastre e organize as funções institucionais usadas nas alocações dos policiais.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/assignments/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova função
            </Link>
          </Button>
        ) : null}
      </div>

      <AssignmentsFilters
        search={search}
        category={category}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCategoryChange={(value) => {
          setCategory(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCategory("");
          setPage(1);
        }}
      />

      {assignmentsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : assignmentsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar funções</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !assignmentsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma função encontrada</CardTitle>
            <CardDescription>Crie uma nova função ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <AssignmentsTable assignments={assignmentsQuery.data.data} />
          <Pagination
            currentPage={assignmentsQuery.data.meta.current_page}
            lastPage={assignmentsQuery.data.meta.last_page}
            total={assignmentsQuery.data.meta.total}
            from={assignmentsQuery.data.meta.from}
            to={assignmentsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={assignmentsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
