"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateAssignmentMutation, useUpdateAssignmentMutation } from "@/hooks/use-assignment-mutations";
import type { AssignmentItem, CreateAssignmentDTO, UpdateAssignmentDTO } from "@/types/assignment.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const assignmentFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
  category: z.string().max(50, "A categoria deve ter no máximo 50 caracteres.").optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormProps {
  mode: "create" | "edit";
  assignment?: AssignmentItem;
}

export function AssignmentForm({ mode, assignment }: AssignmentFormProps) {
  const router = useRouter();
  const createMutation = useCreateAssignmentMutation();
  const updateMutation = useUpdateAssignmentMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      name: assignment?.name ?? "",
      category: assignment?.category ?? "",
    },
  });

  useEffect(() => {
    if (!assignment) {
      return;
    }

    reset({
      name: assignment.name,
      category: assignment.category ?? "",
    });
  }, [assignment, reset]);

  async function onSubmit(values: AssignmentFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      category: values.category?.trim() ? values.category.trim().toLowerCase() : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateAssignmentDTO);
      router.push(`/assignments/${response.data.id}`);
      return;
    }

    if (!assignment) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: assignment.id,
      payload: payloadBase satisfies UpdateAssignmentDTO,
    });
    router.push(`/assignments/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova função/atribuição" : "Editar função/atribuição"}</CardTitle>
        <CardDescription>
          Funções ficam dentro do painel Gestor e são usadas para classificar o papel do policial dentro das alocações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex.: Patrulhamento, Guarda Externa, Escolta" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" placeholder="Ex.: operational, administrative, security" {...register("category")} />
            <p className="text-xs text-slate-500">Opcional. A categoria é enviada em minúsculas para manter padrão com a API.</p>
            {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Alterações neste cadastro impactam os seletores e os históricos de alocação de policiais vinculados a funções institucionais.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/assignments" : `/assignments/${assignment?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar função" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
