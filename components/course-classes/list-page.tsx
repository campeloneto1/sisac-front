"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useCourseClasses } from "@/hooks/use-course-classes";
import { useCourses } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseClassesFilters } from "@/components/course-classes/filters";
import { CourseClassesTable } from "@/components/course-classes/table";

export function CourseClassesListPage() {
  const permissions = usePermissions("course-classes");
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      course_id: courseId !== "all" ? Number(courseId) : null,
      status: status !== "all" ? status : undefined,
    }),
    [courseId, page, search, status],
  );
  const courseClassesQuery = useCourseClasses(filters);
  const coursesQuery = useCourses({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` para visualizar turmas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Turmas de curso</h1>
          <p className="text-sm text-slate-500">Gerencie as turmas da sua subunidade, com planejamento, execucao e snapshot das disciplinas.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/course-classes/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova turma
            </Link>
          </Button>
        ) : null}
      </div>

      <CourseClassesFilters
        search={search}
        courseId={courseId}
        status={status}
        courses={coursesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onCourseChange={(value) => {
          setCourseId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setCourseId("all");
          setStatus("all");
          setPage(1);
        }}
      />

      {courseClassesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : courseClassesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar turmas</CardTitle>
            <CardDescription>Verifique a API, a subunidade ativa e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !courseClassesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma turma encontrada</CardTitle>
            <CardDescription>Crie uma nova turma ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <CourseClassesTable courseClasses={courseClassesQuery.data.data} />
          <Pagination
            currentPage={courseClassesQuery.data.meta.current_page}
            lastPage={courseClassesQuery.data.meta.last_page}
            total={courseClassesQuery.data.meta.total}
            from={courseClassesQuery.data.meta.from}
            to={courseClassesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={courseClassesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
