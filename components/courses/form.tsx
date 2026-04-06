"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCourseMutation, useUpdateCourseMutation } from "@/hooks/use-course-mutations";
import type { CourseItem, CreateCourseDTO, UpdateCourseDTO } from "@/types/course.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const courseFormSchema = z.object({
  name: z.string().min(3, "O nome precisa ter ao menos 3 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
  abbreviation: z.string().min(2, "A sigla precisa ter ao menos 2 caracteres.").max(10, "A sigla deve ter no maximo 10 caracteres."),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  mode: "create" | "edit";
  course?: CourseItem;
}

export function CourseForm({ mode, course }: CourseFormProps) {
  const router = useRouter();
  const createMutation = useCreateCourseMutation();
  const updateMutation = useUpdateCourseMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: course?.name ?? "",
      abbreviation: course?.abbreviation ?? "",
    },
  });

  useEffect(() => {
    if (!course) {
      return;
    }

    reset({
      name: course.name,
      abbreviation: course.abbreviation,
    });
  }, [course, reset]);

  async function onSubmit(values: CourseFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim().toUpperCase(),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateCourseDTO);
      router.push(`/courses/${response.data.id}`);
      return;
    }

    if (!course) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: course.id,
      payload: payloadBase satisfies UpdateCourseDTO,
    });
    router.push(`/courses/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo curso" : "Editar curso"}</CardTitle>
        <CardDescription>
          Cursos ficam na area geral e servem como base para turmas, disciplinas e historicos formativos dos policiais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Curso de Formacao de Sargentos" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input id="abbreviation" placeholder="Ex.: CFS" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">A API converte a sigla para maiusculas automaticamente.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Alteracoes neste cadastro impactam turmas, disciplinas e futuros modulos de historico de cursos dos policiais.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/courses" : `/courses/${course?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar curso" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
