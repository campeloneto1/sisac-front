"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, UserCircle2 } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useCourseClasses } from "@/hooks/use-course-classes";
import { usePermissions } from "@/hooks/use-permissions";
import { useCourse } from "@/hooks/use-courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseDisciplinesSection } from "@/components/courses/disciplines-section";
import { CourseClassesTable } from "@/components/course-classes/table";

export function CourseShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("courses");
  const courseClassesPermissions = usePermissions("course-classes");
  const { activeSubunit } = useSubunit();
  const courseQuery = useCourse(params.id);
  const canViewCourseClasses =
    courseClassesPermissions.canViewAny || courseClassesPermissions.canView;
  const courseClassesQuery = useCourseClasses(
    {
      per_page: 100,
      course_id: Number(params.id),
    },
    Boolean(activeSubunit) && canViewCourseClasses,
  );

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para visualizar cursos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar curso</CardTitle>
          <CardDescription>Os dados do curso nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const course = courseQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{course.name}</h1>
            <Badge variant="secondary">{course.abbreviation}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Curso cadastrado na area geral para organizar turmas, disciplinas e historicos formativos dos policiais.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/courses/${course.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Informacoes gerais</CardTitle>
            <CardDescription>Dados basicos do curso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nome</p>
                <p className="text-sm text-slate-700">{course.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sigla</p>
                <p className="text-sm text-slate-700">{course.abbreviation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Informacoes de criacao e atualizacao do registro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {course.creator ? `${course.creator.name} (${course.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {course.updater ? `${course.updater.name} (${course.updater.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CourseDisciplinesSection courseId={course.id} courseName={course.name} />

      {canViewCourseClasses ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Turmas do curso</CardTitle>
            <CardDescription>
              Turmas vinculadas a este curso, exibidas no mesmo padrao em tabela dos outros modulos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!activeSubunit ? (
              <p className="text-sm text-slate-500">
                Selecione uma subunidade ativa para carregar as turmas deste curso.
              </p>
            ) : courseClassesQuery.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : courseClassesQuery.isError ? (
              <p className="text-sm text-slate-500">
                Nao foi possivel carregar as turmas vinculadas a este curso.
              </p>
            ) : !courseClassesQuery.data?.data.length ? (
              <p className="text-sm text-slate-500">
                Nenhuma turma encontrada para este curso na subunidade ativa.
              </p>
            ) : (
              <CourseClassesTable courseClasses={courseClassesQuery.data.data} />
            )}

            <div className="flex justify-end">
              <Button asChild variant="outline">
                <Link href={`/course-classes?course_id=${course.id}`}>
                  Abrir modulo de turmas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
