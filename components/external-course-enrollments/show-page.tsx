"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, CalendarDays, FileBadge2, ScrollText, UserCircle2 } from "lucide-react";

import { useCourseEnrollment } from "@/hooks/use-course-enrollments";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getStatusVariant(color: string) {
  switch (color) {
    case "green":
      return "success";
    case "red":
      return "danger";
    case "yellow":
      return "warning";
    case "gray":
      return "secondary";
    case "blue":
    default:
      return "info";
  }
}

export function ExternalCourseEnrollmentShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("course-enrollments");
  const enrollmentQuery = useCourseEnrollment(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar cursos externos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (enrollmentQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (enrollmentQuery.isError || !enrollmentQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar curso externo</CardTitle>
          <CardDescription>Os dados do registro externo nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const enrollment = enrollmentQuery.data.data;

  if (!enrollment.is_external_course) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Registro nao suportado</CardTitle>
          <CardDescription>Este item pertence ao fluxo interno de turmas e deve ser acompanhado em `CourseClasses`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {enrollment.course?.name ?? `Curso #${enrollment.course_id}`}
            </h1>
            <Badge variant={getStatusVariant(enrollment.status_color)}>{enrollment.status_label}</Badge>
            <Badge variant="outline">Externo</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Registro simplificado do historico externo do policial, sem criacao de turma.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/external-course-enrollments">Voltar</Link>
          </Button>
          {permissions.canUpdate ? (
            <Button asChild variant="outline">
              <Link href={`/external-course-enrollments/${enrollment.id}/edit`}>Editar</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Informacoes gerais</CardTitle>
            <CardDescription>Resumo do curso externo e do policial vinculado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Policial</p>
                <p className="text-sm text-slate-700">{enrollment.user?.name ?? `Usuário #${enrollment.user_id}`}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Curso</p>
                <p className="text-sm text-slate-700">
                  {enrollment.course?.name ?? `Curso #${enrollment.course_id}`} {enrollment.course?.abbreviation ? `(${enrollment.course.abbreviation})` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Periodo</p>
                <p className="text-sm text-slate-700">{enrollment.start_date ?? "-"} ate {enrollment.end_date ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Documentacao</CardTitle>
            <CardDescription>Boletim, certificado e observacoes do registro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ScrollText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Boletim</p>
                <p className="text-sm text-slate-700">
                  {enrollment.bulletin ?? "Nao informado"} {enrollment.bulletin_date ? `(${enrollment.bulletin_date})` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileBadge2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Certificado</p>
                <p className="text-sm text-slate-700">
                  {enrollment.certificate_number ?? "Nao informado"} {enrollment.certificate_issued_at ? `(${enrollment.certificate_issued_at})` : ""}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Observacoes</p>
              <p className="mt-2 text-sm text-slate-700">{enrollment.notes || "Nenhuma observacao registrada."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
