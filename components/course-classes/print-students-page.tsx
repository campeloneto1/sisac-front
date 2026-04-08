"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import { useCourseClass } from "@/hooks/use-course-classes";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerCourses } from "@/hooks/use-police-officer-courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "enrolled":
      return "Inscrito";
    case "in_progress":
      return "Em andamento";
    case "completed":
      return "Concluido";
    case "failed":
      return "Reprovado";
    case "dropped":
      return "Desistente";
    case "cancelled":
      return "Cancelado";
    default:
      return "-";
  }
}

export function CourseClassPrintStudentsPage() {
  const params = useParams<{ id: string }>();
  const classPermissions = usePermissions("course-classes");
  const studentsPermissions = usePermissions("police-officer-courses");
  const courseClassQuery = useCourseClass(params.id);
  const filters = useMemo(
    () => ({
      course_class_id: Number(params.id),
      per_page: 100,
    }),
    [params.id],
  );
  const studentsQuery = usePoliceOfficerCourses(filters, studentsPermissions.canViewAny || studentsPermissions.canView);

  if (!classPermissions.canView || (!studentsPermissions.canViewAny && !studentsPermissions.canView)) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa das permissões de visualizacao da turma e dos alunos para imprimir a lista.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseClassQuery.isLoading || studentsQuery.isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  if (courseClassQuery.isError || !courseClassQuery.data || studentsQuery.isError) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar lista de alunos</CardTitle>
          <CardDescription>Os dados da turma ou das matriculas não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const courseClass = courseClassQuery.data.data;
  const students = studentsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Lista de alunos para impressao</h1>
          <p className="mt-2 text-sm text-slate-500">Impressao da relacao de alunos vinculados a esta turma.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/course-classes/${courseClass.id}/students`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para alunos
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir alunos
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white print:border-0 print:shadow-none">
        <CardHeader className="space-y-4 print:px-0">
          <div className="space-y-2">
            <CardTitle className="text-2xl text-slate-900">Relacao de alunos</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {courseClass.name ?? `Turma #${courseClass.id}`} • {courseClass.course ? `${courseClass.course.name} (${courseClass.course.abbreviation})` : "Curso não informado"}
            </CardDescription>
          </div>

          <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2 print:grid-cols-2">
            <div>
              <p className="font-medium text-slate-900">Período planejado</p>
              <p>{courseClass.planned_start_date ?? "-"} ate {courseClass.planned_end_date ?? "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Período real</p>
              <p>{courseClass.start_date ?? "-"} ate {courseClass.end_date ?? "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Coordenador</p>
              <p>{courseClass.coordinator?.name ?? "Não informado"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Monitor</p>
              <p>{courseClass.monitor?.name ?? "Não informado"}</p>
            </div>
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="print:px-0">
          {students.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 print:rounded-none print:border-slate-300">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">#</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Aluno</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Nome de guerra</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Matrícula</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id} className="align-top">
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{index + 1}</td>
                      <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900">
                        {student.police_officer?.name ?? student.police_officer?.user?.name ?? `Policial #${student.police_officer_id}`}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{student.police_officer?.war_name ?? "-"}</td>
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">
                        {student.police_officer?.registration_number ?? "-"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{getStatusLabel(student.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum aluno matriculado nesta turma.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
