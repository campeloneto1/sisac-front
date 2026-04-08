"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreatePatrimonyTypeMutation,
  useUpdatePatrimonyTypeMutation,
} from "@/hooks/use-patrimony-type-mutations";
import type {
  CreatePatrimonyTypeDTO,
  PatrimonyTypeItem,
  UpdatePatrimonyTypeDTO,
} from "@/types/patrimony-type.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const patrimonyTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(100, "O nome deve ter no maximo 100 caracteres."),
  description: z
    .string()
    .max(1000, "A descricao deve ter no maximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
});

type PatrimonyTypeFormValues = z.infer<typeof patrimonyTypeFormSchema>;

interface PatrimonyTypeFormProps {
  mode: "create" | "edit";
  patrimonyType?: PatrimonyTypeItem;
}

export function PatrimonyTypeForm({
  mode,
  patrimonyType,
}: PatrimonyTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreatePatrimonyTypeMutation();
  const updateMutation = useUpdatePatrimonyTypeMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatrimonyTypeFormValues>({
    resolver: zodResolver(patrimonyTypeFormSchema),
    defaultValues: {
      name: patrimonyType?.name ?? "",
      description: patrimonyType?.description ?? "",
    },
  });

  useEffect(() => {
    if (!patrimonyType) {
      return;
    }

    reset({
      name: patrimonyType.name,
      description: patrimonyType.description ?? "",
    });
  }, [patrimonyType, reset]);

  async function onSubmit(values: PatrimonyTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreatePatrimonyTypeDTO,
      );
      router.push(`/patrimony-types/${response.data.id}`);
      return;
    }

    if (!patrimonyType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: patrimonyType.id,
      payload: payloadBase satisfies UpdatePatrimonyTypeDTO,
    });
    router.push(`/patrimony-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo tipo de patrimonio"
            : "Editar tipo de patrimonio"}
        </CardTitle>
        <CardDescription>
          Tipos de patrimonio ficam em Administrador e sustentam a
          classificacao mestre usada pelo modulo de patrimonio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Equipamento, Imovel, Mobiliario, Informatica"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Descreva como esse tipo deve ser usado na classificacao administrativa dos patrimonios."
                {...register("description")}
              />
              <p className="text-xs text-slate-500">
                Campo opcional para orientar o uso do cadastro no dominio de
                patrimonio.
              </p>
              {errors.description ? (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create"
                    ? "/patrimony-types"
                    : `/patrimony-types/${patrimonyType?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar tipo"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
