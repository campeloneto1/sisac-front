"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { useCourse } from "@/hooks/use-courses";
import { CourseForm } from "@/components/courses/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("courses");
  const courseQuery = useCourse(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `update` para editar cursos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (courseQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar curso</CardTitle>
          <CardDescription>O curso nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CourseForm mode="edit" course={courseQuery.data.data} />;
}
