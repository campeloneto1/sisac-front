"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { CourseForm } from "@/components/courses/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseCreatePage() {
  const permissions = usePermissions("courses");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar cursos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CourseForm mode="create" />;
}
