"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { CourseClassForm } from "@/components/course-classes/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseClassCreatePage() {
  const permissions = usePermissions("course-classes");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar turmas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CourseClassForm mode="create" />;
}
