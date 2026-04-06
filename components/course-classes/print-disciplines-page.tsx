"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import { useCourseClassDisciplines } from "@/hooks/use-course-class-disciplines";
import { useCourseClass } from "@/hooks/use-course-classes";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseClassPrintDisciplinesPage() {
  const params = useParams<{ id: string }>();
  const classPermissions = usePermissions("course-classes");
  const disciplinesPermissions = usePermissions("course-class-disciplines");
  const courseClassQuery = useCourseClass(params.id);
  const filters = useMemo(
    () => ({
      course_class_id: Number(params.id),
      per_page: 100,
    }),
    [params.id],
  );
  const disciplinesQuery = useCourseClassDisciplines(
    filters,
    disciplinesPermissions.canViewAny || disciplinesPermissions.canView,
  );

  if (!classPermissions.canView || (!disciplinesPermissions.canViewAny && !disciplinesPermissions.canView)) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa das permissoes de visualizacao da turma e das disciplinas para imprimir a grade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseClassQuery.isLoading || disciplinesQuery.isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  if (courseClassQuery.isError || !courseClassQuery.data || disciplinesQuery.isError) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar grade</CardTitle>
          <CardDescription>Os dados da turma ou das disciplinas nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const courseClass = courseClassQuery.data.data;
  const disciplines = disciplinesQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Grade para impressao</h1>
          <p className="mt-2 text-sm text-slate-500">Impressao da grade da turma com disciplina, carga horaria e professor.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/course-classes/${courseClass.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a turma
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir grade
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white print:border-0 print:shadow-none">
        <CardHeader className="space-y-4 print:px-0">
          <div className="space-y-2">
            <CardTitle className="text-2xl text-slate-900">Grade da turma</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {courseClass.name ?? `Turma #${courseClass.id}`} • {courseClass.course ? `${courseClass.course.name} (${courseClass.course.abbreviation})` : "Curso nao informado"}
            </CardDescription>
          </div>

          <div className="grid gap-4 text-sm text-slate-700 md:grid-cols-2 print:grid-cols-2">
            <div>
              <p className="font-medium text-slate-900">Periodo planejado</p>
              <p>{courseClass.planned_start_date ?? "-"} ate {courseClass.planned_end_date ?? "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Periodo real</p>
              <p>{courseClass.start_date ?? "-"} ate {courseClass.end_date ?? "-"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Coordenador</p>
              <p>{courseClass.coordinator?.name ?? "Nao informado"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Monitor</p>
              <p>{courseClass.monitor?.name ?? "Nao informado"}</p>
            </div>
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="print:px-0">
          {disciplines.length ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 print:rounded-none print:border-slate-300">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Ordem</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Disciplina</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Carga horaria</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold">Professor</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplines.map((discipline) => (
                    <tr key={discipline.id} className="align-top">
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{discipline.order ?? "-"}</td>
                      <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900">{discipline.name}</td>
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">
                        {discipline.workload_hours ? `${discipline.workload_hours}h` : "-"}
                      </td>
                      <td className="border-b border-slate-200 px-4 py-3 text-slate-700">{discipline.instructor?.name ?? "Nao informado"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma disciplina cadastrada para esta turma.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
