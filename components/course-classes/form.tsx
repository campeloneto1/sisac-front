"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCourseClassMutation, useUpdateCourseClassMutation } from "@/hooks/use-course-class-mutations";
import { useCourses } from "@/hooks/use-courses";
import { useUsers } from "@/hooks/use-users";
import { COURSE_CLASS_STATUS_OPTIONS, type CourseClassItem, type CreateCourseClassDTO, type UpdateCourseClassDTO } from "@/types/course-class.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const courseClassSchema = z.object({
  course_id: z.string().refine((value) => value !== "none", "Selecione o curso."),
  name: z.string().max(100, "O nome deve ter no maximo 100 caracteres.").optional(),
  planned_start_date: z.string().optional(),
  planned_end_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string(),
  authorized_by: z.string(),
  coordinator_id: z.string(),
  monitor_id: z.string(),
}).superRefine((values, context) => {
  if (values.planned_start_date && values.planned_end_date && values.planned_end_date < values.planned_start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["planned_end_date"],
      message: "O termino planejado deve ser igual ou posterior ao inicio planejado.",
    });
  }

  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "O termino real deve ser igual ou posterior ao inicio real.",
    });
  }

  if (["ongoing", "completed"].includes(values.status) && !values.start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["start_date"],
      message: "Informe a data de inicio real para turmas em andamento ou concluidas.",
    });
  }

  if (values.status === "completed" && !values.end_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "Informe a data de termino real para turmas concluidas.",
    });
  }
});

type CourseClassFormValues = z.infer<typeof courseClassSchema>;

interface CourseClassFormProps {
  mode: "create" | "edit";
  courseClass?: CourseClassItem;
}

export function CourseClassForm({ mode, courseClass }: CourseClassFormProps) {
  const router = useRouter();
  const createMutation = useCreateCourseClassMutation();
  const updateMutation = useUpdateCourseClassMutation();
  const coursesQuery = useCourses({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CourseClassFormValues>({
    resolver: zodResolver(courseClassSchema),
    defaultValues: {
      course_id: courseClass?.course_id ? String(courseClass.course_id) : "none",
      name: courseClass?.name ?? "",
      planned_start_date: courseClass?.planned_start_date ?? "",
      planned_end_date: courseClass?.planned_end_date ?? "",
      start_date: courseClass?.start_date ?? "",
      end_date: courseClass?.end_date ?? "",
      status: courseClass?.status ?? "planned",
      authorized_by: courseClass?.authorizer_id ? String(courseClass.authorizer_id) : "none",
      coordinator_id: courseClass?.coordinator_id ? String(courseClass.coordinator_id) : "none",
      monitor_id: courseClass?.monitor_id ? String(courseClass.monitor_id) : "none",
    },
  });

  useEffect(() => {
    if (!courseClass) {
      return;
    }

    reset({
      course_id: String(courseClass.course_id),
      name: courseClass.name ?? "",
      planned_start_date: courseClass.planned_start_date ?? "",
      planned_end_date: courseClass.planned_end_date ?? "",
      start_date: courseClass.start_date ?? "",
      end_date: courseClass.end_date ?? "",
      status: courseClass.status ?? "planned",
      authorized_by: courseClass.authorizer_id ? String(courseClass.authorizer_id) : "none",
      coordinator_id: courseClass.coordinator_id ? String(courseClass.coordinator_id) : "none",
      monitor_id: courseClass.monitor_id ? String(courseClass.monitor_id) : "none",
    });
  }, [courseClass, reset]);

  const selectedCourseId = useWatch({ control, name: "course_id" });
  const selectedStatus = useWatch({ control, name: "status" });
  const selectedAuthorizedBy = useWatch({ control, name: "authorized_by" });
  const selectedCoordinatorId = useWatch({ control, name: "coordinator_id" });
  const selectedMonitorId = useWatch({ control, name: "monitor_id" });

  async function onSubmit(values: CourseClassFormValues) {
    const payloadBase = {
      course_id: Number(values.course_id),
      name: values.name?.trim() || null,
      planned_start_date: values.planned_start_date?.trim() ? values.planned_start_date : null,
      planned_end_date: values.planned_end_date?.trim() ? values.planned_end_date : null,
      start_date: values.start_date?.trim() ? values.start_date : null,
      end_date: values.end_date?.trim() ? values.end_date : null,
      status: values.status,
      authorized_by: values.authorized_by !== "none" ? Number(values.authorized_by) : null,
      coordinator_id: values.coordinator_id !== "none" ? Number(values.coordinator_id) : null,
      monitor_id: values.monitor_id !== "none" ? Number(values.monitor_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateCourseClassDTO);
      router.push(`/course-classes/${response.data.id}`);
      return;
    }

    if (!courseClass) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: courseClass.id,
      payload: payloadBase satisfies UpdateCourseClassDTO,
    });
    router.push(`/course-classes/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova turma" : "Editar turma"}</CardTitle>
        <CardDescription>
          Turmas ficam no menu geral, mas sao filtradas pela subunidade ativa e usam o snapshot de disciplinas do curso selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Identificacao</h3>
              <p className="text-sm text-slate-500">Selecione o curso e defina o nome operacional da turma.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select value={selectedCourseId} onValueChange={(value) => setValue("course_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {(coursesQuery.data?.data ?? []).map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course_id ? <p className="text-sm text-destructive">{errors.course_id.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da turma</Label>
                <Input id="name" placeholder="Ex.: Turma 2026.1" {...register("name")} />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Planejamento e execucao</h3>
              <p className="text-sm text-slate-500">Datas planejadas, datas reais e status atual da turma.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="planned_start_date">Inicio planejado</Label>
                <Input id="planned_start_date" type="date" {...register("planned_start_date")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planned_end_date">Termino planejado</Label>
                <Input id="planned_end_date" type="date" {...register("planned_end_date")} />
                {errors.planned_end_date ? <p className="text-sm text-destructive">{errors.planned_end_date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setValue("status", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CLASS_STATUS_OPTIONS.map((statusOption) => (
                      <SelectItem key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Inicio real</Label>
                <Input id="start_date" type="date" {...register("start_date")} />
                {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Termino real</Label>
                <Input id="end_date" type="date" {...register("end_date")} />
                {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Responsaveis</h3>
              <p className="text-sm text-slate-500">Defina os usuarios relacionados a autorizacao e acompanhamento da turma.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Autorizado por</Label>
                <Select value={selectedAuthorizedBy} onValueChange={(value) => setValue("authorized_by", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nao informado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nao informado</SelectItem>
                    {(usersQuery.data?.data ?? []).map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coordenador</Label>
                <Select value={selectedCoordinatorId} onValueChange={(value) => setValue("coordinator_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nao informado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nao informado</SelectItem>
                    {(usersQuery.data?.data ?? []).map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Monitor</Label>
                <Select value={selectedMonitorId} onValueChange={(value) => setValue("monitor_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nao informado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nao informado</SelectItem>
                    {(usersQuery.data?.data ?? []).map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Ao criar a turma, a API copia automaticamente as disciplinas cadastradas no curso para a grade da turma.
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/course-classes" : `/course-classes/${courseClass?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar turma" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
