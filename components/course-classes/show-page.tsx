"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, GraduationCap, Printer, UserCircle2, Users2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useCourseClass } from "@/hooks/use-course-classes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseClassDisciplinesSection } from "@/components/course-classes/disciplines-section";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "ongoing":
      return "warning";
    default:
      return "info";
  }
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "planned":
      return "Planejada";
    case "ongoing":
      return "Em andamento";
    case "completed":
      return "Concluida";
    case "cancelled":
      return "Cancelada";
    default:
      return "Sem status";
  }
}

export function CourseClassShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("course-classes");
  const disciplinesPermissions = usePermissions("course-class-disciplines");
  const studentsPermissions = usePermissions("police-officer-courses");
  const courseClassQuery = useCourseClass(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `view` para visualizar turmas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseClassQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (courseClassQuery.isError || !courseClassQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar turma</CardTitle>
          <CardDescription>Os dados da turma nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const courseClass = courseClassQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{courseClass.name ?? `Turma #${courseClass.id}`}</h1>
            <Badge variant={getStatusVariant(courseClass.status)}>{getStatusLabel(courseClass.status)}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {courseClass.course ? `${courseClass.course.name} (${courseClass.course.abbreviation})` : "Curso nao informado"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Turma operacional vinculada a curso e subunidade, com snapshot de disciplinas e acompanhamento de execucao.
          </p>
        </div>

        {permissions.canUpdate ||
        disciplinesPermissions.canViewAny ||
        disciplinesPermissions.canView ||
        studentsPermissions.canViewAny ||
        studentsPermissions.canView ? (
          <div className="flex flex-wrap gap-2">
            {disciplinesPermissions.canViewAny || disciplinesPermissions.canView ? (
              <Button asChild variant="outline">
                <Link href={`/course-classes/${courseClass.id}/print-disciplines`}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir grade
                </Link>
              </Button>
            ) : null}
            {studentsPermissions.canViewAny || studentsPermissions.canView ? (
              <Button asChild variant="outline">
                <Link href={`/course-classes/${courseClass.id}/print-students`}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir alunos
                </Link>
              </Button>
            ) : null}
            {studentsPermissions.canViewAny || studentsPermissions.canView ? (
              <Button asChild variant="outline">
                <Link href={`/course-classes/${courseClass.id}/students`}>Gerenciar alunos</Link>
              </Button>
            ) : null}
            {permissions.canUpdate ? (
              <Button asChild variant="outline">
                <Link href={`/course-classes/${courseClass.id}/edit`}>Editar</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Cronograma</CardTitle>
            <CardDescription>Planejamento e datas reais da turma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Periodo planejado</p>
                <p className="text-sm text-slate-700">{courseClass.planned_start_date ?? "-"} ate {courseClass.planned_end_date ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Periodo real</p>
                <p className="text-sm text-slate-700">{courseClass.start_date ?? "-"} ate {courseClass.end_date ?? "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Curso</p>
                <p className="text-sm text-slate-700">{courseClass.course ? `${courseClass.course.name} (${courseClass.course.abbreviation})` : "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Responsaveis</CardTitle>
            <CardDescription>Usuarios vinculados a autorizacao e acompanhamento da turma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Users2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Autorizado por</p>
                <p className="text-sm text-slate-700">{courseClass.authorizer ? `${courseClass.authorizer.name} (${courseClass.authorizer.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Users2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Coordenador</p>
                <p className="text-sm text-slate-700">{courseClass.coordinator ? `${courseClass.coordinator.name} (${courseClass.coordinator.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Users2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monitor</p>
                <p className="text-sm text-slate-700">{courseClass.monitor ? `${courseClass.monitor.name} (${courseClass.monitor.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{courseClass.creator ? `${courseClass.creator.name} (${courseClass.creator.email})` : "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CourseClassDisciplinesSection
        courseClassId={courseClass.id}
        courseClassName={courseClass.name ?? `Turma #${courseClass.id}`}
      />
    </div>
  );
}
