"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateCourseEnrollmentMutation,
  useUpdateCourseEnrollmentMutation,
} from "@/hooks/use-course-enrollment-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { COURSE_ENROLLMENT_STATUS_OPTIONS, type CreateCourseEnrollmentDTO, type CourseEnrollmentItem, type UpdateCourseEnrollmentDTO } from "@/types/course-enrollment.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const studentSchema = z.object({
  user_id: z.string().refine((value) => value !== "none", "Selecione o usuário."),
  enrollment_number: z.string().max(50, "O número de matrícula deve ter no máximo 50 caracteres.").optional(),
  bulletin: z.string().max(100, "O boletim deve ter no máximo 100 caracteres.").optional(),
  bulletin_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  certificate_number: z.string().max(100, "O número do certificado deve ter no máximo 100 caracteres.").optional(),
  certificate_issued_at: z.string().optional(),
  final_grade: z.string().optional(),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres.").optional(),
  status: z.string(),
}).superRefine((values, context) => {
  if (values.end_date && values.start_date && values.end_date < values.start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "A data de término deve ser igual ou posterior a data de início.",
    });
  }

  if (["completed", "failed", "dropped", "cancelled"].includes(values.status) && !values.end_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "Informe a data de término para matrículas encerradas.",
    });
  }

  if (values.final_grade && (Number(values.final_grade) < 0 || Number(values.final_grade) > 100)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["final_grade"],
      message: "A nota final deve estar entre 0 e 100.",
    });
  }
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface CourseClassStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseClassId: number;
  courseClassName: string;
  courseId: number;
  studentCourse?: CourseEnrollmentItem | null;
}

export function CourseClassStudentsDialog({
  open,
  onOpenChange,
  courseClassId,
  courseClassName,
  courseId,
  studentCourse,
}: CourseClassStudentsDialogProps) {
  const createMutation = useCreateCourseEnrollmentMutation();
  const updateMutation = useUpdateCourseEnrollmentMutation();
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      user_id: studentCourse?.user_id ? String(studentCourse.user_id) : "none",
      enrollment_number: studentCourse?.enrollment_number ?? "",
      bulletin: studentCourse?.bulletin ?? "",
      bulletin_date: studentCourse?.bulletin_date ?? "",
      start_date: studentCourse?.start_date ?? "",
      end_date: studentCourse?.end_date ?? "",
      certificate_number: studentCourse?.certificate_number ?? "",
      certificate_issued_at: studentCourse?.certificate_issued_at ?? "",
      final_grade: studentCourse?.final_grade?.toString() ?? "",
      notes: studentCourse?.notes ?? "",
      status: studentCourse?.status ?? "enrolled",
    },
  });

  useEffect(() => {
    reset({
      user_id: studentCourse?.user_id ? String(studentCourse.user_id) : "none",
      enrollment_number: studentCourse?.enrollment_number ?? "",
      bulletin: studentCourse?.bulletin ?? "",
      bulletin_date: studentCourse?.bulletin_date ?? "",
      start_date: studentCourse?.start_date ?? "",
      end_date: studentCourse?.end_date ?? "",
      certificate_number: studentCourse?.certificate_number ?? "",
      certificate_issued_at: studentCourse?.certificate_issued_at ?? "",
      final_grade: studentCourse?.final_grade?.toString() ?? "",
      notes: studentCourse?.notes ?? "",
      status: studentCourse?.status ?? "enrolled",
    });
  }, [studentCourse, open, reset]);

  const selectedUserId = useWatch({ control, name: "user_id" });
  const selectedStatus = useWatch({ control, name: "status" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: StudentFormValues) {
    const payloadBase = {
      user_id: Number(values.user_id),
      course_id: courseId,
      course_class_id: courseClassId,
      enrollment_number: values.enrollment_number?.trim() || null,
      bulletin: values.bulletin?.trim() || null,
      bulletin_date: values.bulletin_date?.trim() || null,
      start_date: values.start_date?.trim() || null,
      end_date: values.end_date?.trim() || null,
      certificate_number: values.certificate_number?.trim() || null,
      certificate_issued_at: values.certificate_issued_at?.trim() || null,
      final_grade: values.final_grade?.trim() ? Number(values.final_grade) : null,
      notes: values.notes?.trim() || null,
      status: values.status as CreateCourseEnrollmentDTO["status"],
    };

    if (studentCourse) {
      await updateMutation.mutateAsync({
        id: studentCourse.id,
        payload: payloadBase satisfies UpdateCourseEnrollmentDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateCourseEnrollmentDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{studentCourse ? "Editar matrícula" : "Matricular policial"}</DialogTitle>
          <DialogDescription>
            {studentCourse
              ? `Atualize a matrícula do policial em ${courseClassName}.`
              : `Cadastre um novo aluno para a turma ${courseClassName}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select value={selectedUserId} onValueChange={(value) => setValue("user_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione</SelectItem>
                {(policeOfficersQuery.data?.data ?? []).map((officer) => (
                  <SelectItem key={officer.id} value={String(officer.user_id ?? officer.id)}>
                    {(officer.name ?? officer.user?.name ?? officer.war_name) || `Usuário #${officer.user_id ?? officer.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.user_id ? <p className="text-sm text-destructive">{errors.user_id.message}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enrollment-number">Número de Matrícula</Label>
              <Input id="enrollment-number" placeholder="Ex.: 2024001" {...register("enrollment_number")} />
              {errors.enrollment_number ? <p className="text-sm text-destructive">{errors.enrollment_number.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin">Boletim</Label>
              <Input id="bulletin" placeholder="Ex.: BG-1234/2026" {...register("bulletin")} />
              {errors.bulletin ? <p className="text-sm text-destructive">{errors.bulletin.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bulletin-date">Data do Boletim</Label>
              <Input id="bulletin-date" type="date" {...register("bulletin_date")} />
              {errors.bulletin_date ? <p className="text-sm text-destructive">{errors.bulletin_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setValue("status", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_ENROLLMENT_STATUS_OPTIONS.map((statusOption) => (
                    <SelectItem key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data de Início</Label>
              <Input id="start-date" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Data de Término</Label>
              <Input id="end-date" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="certificate-number">Número do Certificado</Label>
              <Input id="certificate-number" placeholder="Ex.: CERT-2024-001" {...register("certificate_number")} />
              {errors.certificate_number ? <p className="text-sm text-destructive">{errors.certificate_number.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate-issued-at">Data de Emissão</Label>
              <Input id="certificate-issued-at" type="date" {...register("certificate_issued_at")} />
              {errors.certificate_issued_at ? <p className="text-sm text-destructive">{errors.certificate_issued_at.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="final-grade">Nota Final (0-100)</Label>
              <Input id="final-grade" inputMode="decimal" placeholder="Ex.: 8.5" {...register("final_grade")} />
              {errors.final_grade ? <p className="text-sm text-destructive">{errors.final_grade.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" placeholder="Observações adicionais sobre a matrícula..." rows={3} {...register("notes")} />
            {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : studentCourse ? "Salvar matrícula" : "Matricular usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
