"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { ExternalCourseEnrollmentForm } from "@/components/external-course-enrollments/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ExternalCourseEnrollmentCreatePage() {
  const permissions = usePermissions("course-enrollments");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para registrar cursos externos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ExternalCourseEnrollmentForm mode="create" />;
}
