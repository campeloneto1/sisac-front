"use client";

import { useParams } from "next/navigation";

import { useCourseEnrollment } from "@/hooks/use-course-enrollments";
import { usePermissions } from "@/hooks/use-permissions";
import { ExternalCourseEnrollmentForm } from "@/components/external-course-enrollments/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExternalCourseEnrollmentEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("course-enrollments");
  const enrollmentQuery = useCourseEnrollment(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar cursos externos.</CardDescription>
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
          <CardTitle>Erro ao carregar registro externo</CardTitle>
          <CardDescription>O curso externo nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!enrollmentQuery.data.data.is_external_course) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Registro nao suportado</CardTitle>
          <CardDescription>Este item pertence ao fluxo interno de turmas e deve ser administrado em `CourseClasses`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ExternalCourseEnrollmentForm mode="edit" enrollment={enrollmentQuery.data.data} />;
}
