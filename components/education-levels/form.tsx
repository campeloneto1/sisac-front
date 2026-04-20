"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateEducationLevelMutation, useUpdateEducationLevelMutation } from "@/hooks/use-education-level-mutations";
import type { CreateEducationLevelDTO, EducationLevelItem, UpdateEducationLevelDTO } from "@/types/education-level.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const educationLevelFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no máximo 100 caracteres."),
});

type EducationLevelFormValues = z.infer<typeof educationLevelFormSchema>;

interface EducationLevelFormProps {
  mode: "create" | "edit";
  educationLevel?: EducationLevelItem;
}

export function EducationLevelForm({ mode, educationLevel }: EducationLevelFormProps) {
  const router = useRouter();
  const createMutation = useCreateEducationLevelMutation();
  const updateMutation = useUpdateEducationLevelMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationLevelFormValues>({
    resolver: zodResolver(educationLevelFormSchema),
    defaultValues: {
      name: educationLevel?.name ?? "",
    },
  });

  useEffect(() => {
    if (!educationLevel) {
      return;
    }

    reset({
      name: educationLevel.name,
    });
  }, [educationLevel, reset]);

  async function onSubmit(values: EducationLevelFormValues) {
    const payloadBase = {
      name: values.name.trim(),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateEducationLevelDTO);
      router.push(`/education-levels/${response.data.id}`);
      return;
    }

    if (!educationLevel) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: educationLevel.id,
      payload: payloadBase satisfies UpdateEducationLevelDTO,
    });
    router.push(`/education-levels/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo nivel de escolaridade" : "Editar nivel de escolaridade"}</CardTitle>
        <CardDescription>
          Niveis de escolaridade ficam dentro de Administrador e servem como base para o cadastro e a classificação de policiais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" placeholder="Ex.: Ensino Medio Completo" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/education-levels" : `/education-levels/${educationLevel?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar nivel" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
