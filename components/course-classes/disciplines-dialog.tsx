"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateCourseClassDisciplineMutation,
  useUpdateCourseClassDisciplineMutation,
} from "@/hooks/use-course-class-discipline-mutations";
import { useUsers } from "@/hooks/use-users";
import type {
  CourseClassDisciplineItem,
  CreateCourseClassDisciplineDTO,
  UpdateCourseClassDisciplineDTO,
} from "@/types/course-class-discipline.type";
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

const disciplineSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(150, "O nome deve ter no maximo 150 caracteres."),
  workload_hours: z.string().optional(),
  instructor_id: z.string(),
  order: z.string().optional(),
});

type DisciplineFormValues = z.infer<typeof disciplineSchema>;

interface CourseClassDisciplinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseClassId: number;
  courseClassName: string;
  discipline?: CourseClassDisciplineItem | null;
}

export function CourseClassDisciplinesDialog({
  open,
  onOpenChange,
  courseClassId,
  courseClassName,
  discipline,
}: CourseClassDisciplinesDialogProps) {
  const createMutation = useCreateCourseClassDisciplineMutation();
  const updateMutation = useUpdateCourseClassDisciplineMutation();
  const usersQuery = useUsers({ per_page: 100 });
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<DisciplineFormValues>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      name: discipline?.name ?? "",
      workload_hours: discipline?.workload_hours?.toString() ?? "",
      instructor_id: discipline?.instructor_id ? String(discipline.instructor_id) : "none",
      order: discipline?.order?.toString() ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: discipline?.name ?? "",
      workload_hours: discipline?.workload_hours?.toString() ?? "",
      instructor_id: discipline?.instructor_id ? String(discipline.instructor_id) : "none",
      order: discipline?.order?.toString() ?? "",
    });
  }, [discipline, open, reset]);

  const selectedInstructorId = useWatch({ control, name: "instructor_id" });
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: DisciplineFormValues) {
    const payloadBase = {
      course_class_id: courseClassId,
      name: values.name.trim(),
      workload_hours: values.workload_hours?.trim() ? Number(values.workload_hours) : null,
      instructor_id: values.instructor_id !== "none" ? Number(values.instructor_id) : null,
      order: values.order?.trim() ? Number(values.order) : 0,
    };

    if (discipline) {
      await updateMutation.mutateAsync({
        id: discipline.id,
        payload: payloadBase satisfies UpdateCourseClassDisciplineDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateCourseClassDisciplineDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{discipline ? "Editar disciplina da turma" : "Nova disciplina da turma"}</DialogTitle>
          <DialogDescription>
            {discipline
              ? `Atualize a disciplina vinculada a ${courseClassName}.`
              : `Cadastre uma nova disciplina para ${courseClassName}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="course-class-discipline-name">Nome *</Label>
            <Input id="course-class-discipline-name" placeholder="Ex.: Armamento e Tiro" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-class-discipline-workload">Carga horaria</Label>
              <Input id="course-class-discipline-workload" inputMode="numeric" placeholder="Ex.: 40" {...register("workload_hours")} />
              {errors.workload_hours ? <p className="text-sm text-destructive">{errors.workload_hours.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-class-discipline-order">Ordem</Label>
              <Input id="course-class-discipline-order" inputMode="numeric" placeholder="Ex.: 1" {...register("order")} />
              {errors.order ? <p className="text-sm text-destructive">{errors.order.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instrutor</Label>
            <Select value={selectedInstructorId} onValueChange={(value) => setValue("instructor_id", value, { shouldValidate: true })}>
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

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : discipline ? "Salvar disciplina" : "Criar disciplina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
