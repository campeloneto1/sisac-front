"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateGenderMutation, useUpdateGenderMutation } from "@/hooks/use-gender-mutations";
import type { CreateGenderDTO, GenderItem, UpdateGenderDTO } from "@/types/gender.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const genderFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
});

type GenderFormValues = z.infer<typeof genderFormSchema>;

interface GenderFormProps {
  mode: "create" | "edit";
  gender?: GenderItem;
}

export function GenderForm({ mode, gender }: GenderFormProps) {
  const router = useRouter();
  const createMutation = useCreateGenderMutation();
  const updateMutation = useUpdateGenderMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenderFormValues>({
    resolver: zodResolver(genderFormSchema),
    defaultValues: {
      name: gender?.name ?? "",
    },
  });

  useEffect(() => {
    if (!gender) {
      return;
    }

    reset({
      name: gender.name,
    });
  }, [gender, reset]);

  async function onSubmit(values: GenderFormValues) {
    const payloadBase = {
      name: values.name.trim(),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateGenderDTO);
      router.push(`/genders/${response.data.id}`);
      return;
    }

    if (!gender) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: gender.id,
      payload: payloadBase satisfies UpdateGenderDTO,
    });
    router.push(`/genders/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo genero" : "Editar genero"}</CardTitle>
        <CardDescription>Generos ficam dentro de Administrador e servem de apoio para cadastros mestres do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Masculino" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/genders" : `/genders/${gender?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar genero" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
