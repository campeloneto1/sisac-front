"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreatePoliceOfficerCourseMutation,
  useUpdatePoliceOfficerCourseMutation,
} from "@/hooks/use-police-officer-course-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { POLICE_OFFICER_COURSE_STATUS_OPTIONS, type CreatePoliceOfficerCourseDTO, type PoliceOfficerCourseItem, type UpdatePoliceOfficerCourseDTO } from "@/types/police-officer-course.type";
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

const studentSchema = z.object({
  police_officer_id: z.string().refine((value) => value !== "none", "Selecione o policial."),
  workload_hours: z.string().optional(),
  bulletin: z.string().max(100, "O boletim deve ter no máximo 100 caracteres.").optional(),
  start_date: z.string().min(1, "Informe a data de início."),
  end_date: z.string().optional(),
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
      message: "Informe a data de término para matriculas encerradas.",
    });
  }
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface CourseClassStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseClassId: number;
  courseClassName: string;
  studentCourse?: PoliceOfficerCourseItem | null;
}

export function CourseClassStudentsDialog({
  open,
  onOpenChange,
  courseClassId,
  courseClassName,
  studentCourse,
}: CourseClassStudentsDialogProps) {
  const createMutation = useCreatePoliceOfficerCourseMutation();
  const updateMutation = useUpdatePoliceOfficerCourseMutation();
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
      police_officer_id: studentCourse?.police_officer_id ? String(studentCourse.police_officer_id) : "none",
      workload_hours: studentCourse?.workload_hours?.toString() ?? "",
      bulletin: studentCourse?.bulletin ?? "",
      start_date: studentCourse?.start_date ?? "",
      end_date: studentCourse?.end_date ?? "",
      status: studentCourse?.status ?? "enrolled",
    },
  });

  useEffect(() => {
    reset({
      police_officer_id: studentCourse?.police_officer_id ? String(studentCourse.police_officer_id) : "none",
      workload_hours: studentCourse?.workload_hours?.toString() ?? "",
      bulletin: studentCourse?.bulletin ?? "",
      start_date: studentCourse?.start_date ?? "",
      end_date: studentCourse?.end_date ?? "",
      status: studentCourse?.status ?? "enrolled",
    });
  }, [studentCourse, open, reset]);

  const selectedPoliceOfficerId = useWatch({ control, name: "police_officer_id" });
  const selectedStatus = useWatch({ control, name: "status" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: StudentFormValues) {
    const payloadBase = {
      police_officer_id: Number(values.police_officer_id),
      course_class_id: courseClassId,
      workload_hours: values.workload_hours?.trim() ? Number(values.workload_hours) : null,
      bulletin: values.bulletin?.trim() || null,
      start_date: values.start_date,
      end_date: values.end_date?.trim() ? values.end_date : null,
      status: values.status,
    };

    if (studentCourse) {
      await updateMutation.mutateAsync({
        id: studentCourse.id,
        payload: payloadBase satisfies UpdatePoliceOfficerCourseDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreatePoliceOfficerCourseDTO);
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
            <Label>Policial</Label>
            <Select value={selectedPoliceOfficerId} onValueChange={(value) => setValue("police_officer_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione</SelectItem>
                {(policeOfficersQuery.data?.data ?? []).map((officer) => (
                  <SelectItem key={officer.id} value={String(officer.id)}>
                    {(officer.name ?? officer.user?.name ?? officer.war_name) || `Policial #${officer.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.police_officer_id ? <p className="text-sm text-destructive">{errors.police_officer_id.message}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-course-workload">Carga horaria</Label>
              <Input id="student-course-workload" inputMode="numeric" placeholder="Ex.: 120" {...register("workload_hours")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-course-bulletin">Boletim</Label>
              <Input id="student-course-bulletin" placeholder="Ex.: BG-1234/2026" {...register("bulletin")} />
              {errors.bulletin ? <p className="text-sm text-destructive">{errors.bulletin.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="student-course-start">Início</Label>
              <Input id="student-course-start" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-course-end">Término</Label>
              <Input id="student-course-end" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={(value) => setValue("status", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {POLICE_OFFICER_COURSE_STATUS_OPTIONS.map((statusOption) => (
                    <SelectItem key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : studentCourse ? "Salvar matrícula" : "Matricular policial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
