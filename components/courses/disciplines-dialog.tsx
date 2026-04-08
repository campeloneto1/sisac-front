"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateCourseDisciplineMutation,
  useUpdateCourseDisciplineMutation,
} from "@/hooks/use-course-discipline-mutations";
import type {
  CourseDisciplineItem,
  CreateCourseDisciplineDTO,
  UpdateCourseDisciplineDTO,
} from "@/types/course-discipline.type";
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

const disciplineSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(150, "O nome deve ter no máximo 150 caracteres."),
  workload_hours: z.string().optional(),
  order: z.string().optional(),
});

type DisciplineFormValues = z.infer<typeof disciplineSchema>;

interface CourseDisciplinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  courseName: string;
  discipline?: CourseDisciplineItem | null;
}

export function CourseDisciplinesDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  discipline,
}: CourseDisciplinesDialogProps) {
  const createMutation = useCreateCourseDisciplineMutation();
  const updateMutation = useUpdateCourseDisciplineMutation();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<DisciplineFormValues>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      name: discipline?.name ?? "",
      workload_hours: discipline?.workload_hours?.toString() ?? "",
      order: discipline?.order?.toString() ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: discipline?.name ?? "",
      workload_hours: discipline?.workload_hours?.toString() ?? "",
      order: discipline?.order?.toString() ?? "",
    });
  }, [discipline, open, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: DisciplineFormValues) {
    const payloadBase = {
      course_id: courseId,
      name: values.name.trim(),
      workload_hours: values.workload_hours?.trim() ? Number(values.workload_hours) : null,
      order: values.order?.trim() ? Number(values.order) : 0,
    };

    if (discipline) {
      await updateMutation.mutateAsync({
        id: discipline.id,
        payload: payloadBase satisfies UpdateCourseDisciplineDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreateCourseDisciplineDTO);
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{discipline ? "Editar disciplina" : "Nova disciplina"}</DialogTitle>
          <DialogDescription>
            {discipline
              ? `Atualize a disciplina vinculada ao curso ${courseName}.`
              : `Cadastre uma nova disciplina para o curso ${courseName}.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="discipline-name">Nome *</Label>
            <Input id="discipline-name" placeholder="Ex.: Direitos Humanos, Armamento e Tiro" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="discipline-workload">Carga horaria</Label>
              <Input id="discipline-workload" inputMode="numeric" placeholder="Ex.: 40" {...register("workload_hours")} />
              {errors.workload_hours ? <p className="text-sm text-destructive">{errors.workload_hours.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discipline-order">Ordem</Label>
              <Input id="discipline-order" inputMode="numeric" placeholder="Ex.: 1" {...register("order")} />
              {errors.order ? <p className="text-sm text-destructive">{errors.order.message}</p> : null}
            </div>
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
