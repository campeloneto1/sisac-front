"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useCourseEnrollments } from "@/hooks/use-course-enrollments";
import { useCourses } from "@/hooks/use-courses";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { ExternalCourseEnrollmentsFilters } from "@/components/external-course-enrollments/filters";
import { ExternalCourseEnrollmentsTable } from "@/components/external-course-enrollments/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ExternalCourseEnrollmentsListPage() {
  const permissions = usePermissions("course-enrollments");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [courseId, setCourseId] = useState("all");
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const serverFilters = useMemo(
    () => ({
      per_page: 100,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      course_id: courseId !== "all" ? Number(courseId) : undefined,
      user_id: policeOfficerId !== "all" ? Number(policeOfficerId) : undefined,
    }),
    [courseId, policeOfficerId, search, status],
  );

  const enrollmentsQuery = useCourseEnrollments(serverFilters, permissions.canViewAny);
  const coursesQuery = useCourses({ per_page: 100 });
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });

  const externalItems = useMemo(() => {
    const items = enrollmentsQuery.data?.data ?? [];

    return items.filter((item) => item.is_external_course);
  }, [enrollmentsQuery.data?.data]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * perPage;

    return externalItems.slice(start, start + perPage);
  }, [externalItems, page]);

  const lastPage = Math.max(1, Math.ceil(externalItems.length / perPage));
  const from = externalItems.length ? (page - 1) * perPage + 1 : null;
  const to = externalItems.length ? Math.min(page * perPage, externalItems.length) : null;

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar cursos externos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Cursos externos</h1>
          <p className="text-sm text-slate-500">
            Registre historicos simples de cursos externos sem abrir turma.
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/external-course-enrollments/create">
              <Plus className="mr-2 h-4 w-4" />
              Registrar curso externo
            </Link>
          </Button>
        ) : null}
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Fluxo simplificado</CardTitle>
          <CardDescription>
            Este modulo grava diretamente em `course-enrollments` com `course_class_id` nulo. O catalogo de cursos continua sendo mantido em `Cursos`.
          </CardDescription>
        </CardHeader>
      </Card>

      <ExternalCourseEnrollmentsFilters
        search={search}
        status={status}
        courseId={courseId}
        policeOfficerId={policeOfficerId}
        courses={coursesQuery.data?.data ?? []}
        policeOfficers={policeOfficersQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCourseIdChange={(value) => {
          setCourseId(value);
          setPage(1);
        }}
        onPoliceOfficerIdChange={(value) => {
          setPoliceOfficerId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setCourseId("all");
          setPoliceOfficerId("all");
          setPage(1);
        }}
      />

      {enrollmentsQuery.isLoading || coursesQuery.isLoading || policeOfficersQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : enrollmentsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar cursos externos</CardTitle>
            <CardDescription>Verifique a API, a subunidade ativa e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !externalItems.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum curso externo encontrado</CardTitle>
            <CardDescription>Crie um novo registro externo ou ajuste os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ExternalCourseEnrollmentsTable items={pagedItems} />
          <Pagination
            currentPage={page}
            lastPage={lastPage}
            total={externalItems.length}
            from={from}
            to={to}
            onPageChange={setPage}
            isDisabled={enrollmentsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
