"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { useCourseClass } from "@/hooks/use-course-classes";
import { CourseClassForm } from "@/components/course-classes/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseClassEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("course-classes");
  const courseClassQuery = useCourseClass(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar turmas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseClassQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (courseClassQuery.isError || !courseClassQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar turma</CardTitle>
          <CardDescription>Os dados da turma não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CourseClassForm mode="edit" courseClass={courseClassQuery.data.data} />;
}
