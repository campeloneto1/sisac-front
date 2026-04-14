"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateCourseEnrollmentMutation,
  useUpdateCourseEnrollmentMutation,
} from "@/hooks/use-course-enrollment-mutations";
import { useCourses } from "@/hooks/use-courses";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  COURSE_ENROLLMENT_STATUS_OPTIONS,
  type CourseEnrollmentItem,
  type CreateCourseEnrollmentDTO,
  type UpdateCourseEnrollmentDTO,
} from "@/types/course-enrollment.type";

const externalCourseEnrollmentSchema = z.object({
  user_id: z.string().refine((value) => value !== "none", "Selecione o policial."),
  course_id: z.string().refine((value) => value !== "none", "Selecione o curso."),
  bulletin: z.string().max(100, "O boletim deve ter no maximo 100 caracteres.").optional(),
  bulletin_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string(),
  certificate_number: z.string().max(100, "O certificado deve ter no maximo 100 caracteres.").optional(),
  certificate_issued_at: z.string().optional(),
  notes: z.string().max(1000, "As observacoes devem ter no maximo 1000 caracteres.").optional(),
}).superRefine((values, context) => {
  if (values.end_date && values.start_date && values.end_date < values.start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "A data de termino deve ser igual ou posterior a data de inicio.",
    });
  }
});

type ExternalCourseEnrollmentFormValues = z.infer<typeof externalCourseEnrollmentSchema>;

interface ExternalCourseEnrollmentFormProps {
  mode: "create" | "edit";
  enrollment?: CourseEnrollmentItem;
}

export function ExternalCourseEnrollmentForm({
  mode,
  enrollment,
}: ExternalCourseEnrollmentFormProps) {
  const router = useRouter();
  const createMutation = useCreateCourseEnrollmentMutation();
  const updateMutation = useUpdateCourseEnrollmentMutation();
  const coursesQuery = useCourses({ per_page: 100 });
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    register,
    formState: { errors },
  } = useForm<ExternalCourseEnrollmentFormValues>({
    resolver: zodResolver(externalCourseEnrollmentSchema),
    defaultValues: {
      user_id: enrollment?.user_id ? String(enrollment.user_id) : "none",
      course_id: enrollment?.course_id ? String(enrollment.course_id) : "none",
      bulletin: enrollment?.bulletin ?? "",
      bulletin_date: enrollment?.bulletin_date ?? "",
      start_date: enrollment?.start_date ?? "",
      end_date: enrollment?.end_date ?? "",
      status: enrollment?.status ?? "completed",
      certificate_number: enrollment?.certificate_number ?? "",
      certificate_issued_at: enrollment?.certificate_issued_at ?? "",
      notes: enrollment?.notes ?? "",
    },
  });

  useEffect(() => {
    reset({
      user_id: enrollment?.user_id ? String(enrollment.user_id) : "none",
      course_id: enrollment?.course_id ? String(enrollment.course_id) : "none",
      bulletin: enrollment?.bulletin ?? "",
      bulletin_date: enrollment?.bulletin_date ?? "",
      start_date: enrollment?.start_date ?? "",
      end_date: enrollment?.end_date ?? "",
      status: enrollment?.status ?? "completed",
      certificate_number: enrollment?.certificate_number ?? "",
      certificate_issued_at: enrollment?.certificate_issued_at ?? "",
      notes: enrollment?.notes ?? "",
    });
  }, [enrollment, reset]);

  const selectedUserId = watch("user_id");
  const selectedCourseId = watch("course_id");
  const selectedStatus = watch("status");
  const isPending = createMutation.isPending || updateMutation.isPending;

  const policeOfficerOptions = useMemo(
    () =>
      (policeOfficersQuery.data?.data ?? []).map((officer) => ({
        value: String(officer.user_id),
        label: officer.name ?? officer.war_name ?? `Policial #${officer.id}`,
        keywords: [
          officer.registration_number,
          officer.badge_number,
          officer.war_name,
          officer.user?.email,
        ].filter(Boolean) as string[],
      })),
    [policeOfficersQuery.data?.data],
  );

  const courseOptions = useMemo(
    () =>
      (coursesQuery.data?.data ?? []).map((course) => ({
        value: String(course.id),
        label: `${course.name}${course.abbreviation ? ` (${course.abbreviation})` : ""}`,
        keywords: [course.name, course.abbreviation].filter(Boolean) as string[],
      })),
    [coursesQuery.data?.data],
  );

  async function onSubmit(values: ExternalCourseEnrollmentFormValues) {
    const payloadBase = {
      user_id: Number(values.user_id),
      course_id: Number(values.course_id),
      course_class_id: null,
      bulletin: values.bulletin?.trim() || null,
      bulletin_date: values.bulletin_date?.trim() || null,
      start_date: values.start_date?.trim() || null,
      end_date: values.end_date?.trim() || null,
      status: values.status as CreateCourseEnrollmentDTO["status"],
      certificate_number: values.certificate_number?.trim() || null,
      certificate_issued_at: values.certificate_issued_at?.trim() || null,
      notes: values.notes?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateCourseEnrollmentDTO);
      router.push(`/external-course-enrollments/${response.data.id}`);
      return;
    }

    if (!enrollment) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: enrollment.id,
      payload: payloadBase satisfies UpdateCourseEnrollmentDTO,
    });

    router.push(`/external-course-enrollments/${response.data.id}`);
  }

  if (coursesQuery.isLoading || policeOfficersQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Registrar curso externo" : "Editar curso externo"}</CardTitle>
        <CardDescription>
          Fluxo simplificado para registrar cursos externos sem criar turma. O sistema grava a matricula com `course_class_id` nulo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Policial</Label>
            <SearchableSelect
              value={selectedUserId}
              onValueChange={(value) => setValue("user_id", value, { shouldValidate: true })}
              options={[
                { value: "none", label: "Selecione o policial" },
                ...policeOfficerOptions,
              ]}
              placeholder="Selecione o policial"
              searchPlaceholder="Buscar policial"
              emptyMessage="Nenhum policial encontrado."
            />
            {errors.user_id ? <p className="text-sm text-destructive">{errors.user_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Curso</Label>
            <SearchableSelect
              value={selectedCourseId}
              onValueChange={(value) => setValue("course_id", value, { shouldValidate: true })}
              options={[
                { value: "none", label: "Selecione o curso" },
                ...courseOptions,
              ]}
              placeholder="Selecione o curso"
              searchPlaceholder="Buscar curso"
              emptyMessage="Nenhum curso encontrado."
            />
            <p className="text-xs text-slate-500">
              Use aqui apenas cursos externos. O catalogo geral de cursos ainda e compartilhado com os cursos internos.
            </p>
            {errors.course_id ? <p className="text-sm text-destructive">{errors.course_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulletin">Boletim</Label>
            <Input id="bulletin" placeholder="Ex.: BG-1234/2026" {...register("bulletin")} />
            {errors.bulletin ? <p className="text-sm text-destructive">{errors.bulletin.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <SearchableSelect
              value={selectedStatus}
              onValueChange={(value) => setValue("status", value, { shouldValidate: true })}
              options={COURSE_ENROLLMENT_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
                keywords: [option.value],
              }))}
              placeholder="Selecione o status"
              searchPlaceholder="Buscar status"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulletin_date">Data do boletim</Label>
            <Input id="bulletin_date" type="date" {...register("bulletin_date")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Data de inicio</Label>
            <Input id="start_date" type="date" {...register("start_date")} />
            {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Data de termino</Label>
            <Input id="end_date" type="date" {...register("end_date")} />
            {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate_number">Certificado</Label>
            <Input id="certificate_number" placeholder="Numero opcional" {...register("certificate_number")} />
            {errors.certificate_number ? <p className="text-sm text-destructive">{errors.certificate_number.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate_issued_at">Data do certificado</Label>
            <Input id="certificate_issued_at" type="date" {...register("certificate_issued_at")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Informacoes complementares sobre o curso externo..."
              {...register("notes")}
            />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Esse cadastro nao cria turma nem lista de alunos. Ele registra diretamente o historico externo do policial.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/external-course-enrollments" : `/external-course-enrollments/${enrollment?.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Registrar curso externo" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
