"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CoursesFilters } from "@/components/courses/filters";
import { CoursesTable } from "@/components/courses/table";

export function CoursesListPage() {
  const permissions = usePermissions("courses");
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
  const coursesQuery = useCourses(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar cursos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Cursos</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro geral de cursos usados em turmas, disciplinas e históricos formativos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/courses/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo curso
            </Link>
          </Button>
        ) : null}
      </div>

      <CoursesFilters
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

      {coursesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : coursesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar cursos</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !coursesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum curso encontrado</CardTitle>
            <CardDescription>Crie um novo curso ou refine a busca aplicada.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <CoursesTable courses={coursesQuery.data.data} />
          <Pagination
            currentPage={coursesQuery.data.meta.current_page}
            lastPage={coursesQuery.data.meta.last_page}
            total={coursesQuery.data.meta.total}
            from={coursesQuery.data.meta.from}
            to={coursesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={coursesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
