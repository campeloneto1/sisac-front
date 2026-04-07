"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateArmamentSizeMutation,
  useUpdateArmamentSizeMutation,
} from "@/hooks/use-armament-size-mutations";
import type {
  ArmamentSizeItem,
  CreateArmamentSizeDTO,
  UpdateArmamentSizeDTO,
} from "@/types/armament-size.type";
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

const armamentSizeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Informe o nome do tamanho.")
    .max(50, "O nome deve ter no maximo 50 caracteres."),
  slug: z
    .string()
    .max(50, "O slug deve ter no maximo 50 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "O slug deve conter apenas letras minusculas, numeros e hifens.",
    )
    .or(z.literal("")),
  description: z
    .string()
    .max(5000, "A descricao deve ter no maximo 5000 caracteres."),
});

type ArmamentSizeFormValues = z.infer<typeof armamentSizeFormSchema>;

interface ArmamentSizeFormProps {
  mode: "create" | "edit";
  armamentSize?: ArmamentSizeItem;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ArmamentSizeForm({
  mode,
  armamentSize,
}: ArmamentSizeFormProps) {
  const router = useRouter();
  const createMutation = useCreateArmamentSizeMutation();
  const updateMutation = useUpdateArmamentSizeMutation();
  const slugTouchedRef = useRef(Boolean(armamentSize?.slug));

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ArmamentSizeFormValues>({
    resolver: zodResolver(armamentSizeFormSchema),
    defaultValues: {
      name: armamentSize?.name ?? "",
      slug: armamentSize?.slug ?? "",
      description: armamentSize?.description ?? "",
    },
  });

  const watchedName = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!armamentSize) {
      return;
    }

    slugTouchedRef.current = true;
    reset({
      name: armamentSize.name,
      slug: armamentSize.slug,
      description: armamentSize.description ?? "",
    });
  }, [armamentSize, reset]);

  useEffect(() => {
    if (slugTouchedRef.current) {
      return;
    }

    setValue("slug", slugify(watchedName ?? ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, watchedName]);

  async function onSubmit(values: ArmamentSizeFormValues) {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim() || null,
      description: values.description.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateArmamentSizeDTO,
      );
      router.push(`/armament-sizes/${response.data.id}`);
      return;
    }

    if (!armamentSize) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: armamentSize.id,
      payload: payload satisfies UpdateArmamentSizeDTO,
    });
    router.push(`/armament-sizes/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo tamanho de armamento"
            : "Editar tamanho de armamento"}
        </CardTitle>
        <CardDescription>
          Cadastre os tamanhos usados para classificar armamentos no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="armament-size-name">Nome</Label>
              <Input
                id="armament-size-name"
                placeholder="Ex.: M"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="armament-size-slug">Slug</Label>
              <Input
                id="armament-size-slug"
                placeholder="Ex.: m"
                {...register("slug", {
                  onChange: () => {
                    slugTouchedRef.current = true;
                  },
                })}
              />
              <p className="text-xs text-slate-500">
                Se ficar vazio, a API gera automaticamente a partir do nome.
              </p>
              {errors.slug ? (
                <p className="text-sm text-destructive">
                  {errors.slug.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="armament-size-description">Descricao</Label>
              <Textarea
                id="armament-size-description"
                placeholder="Explique quando esse tamanho deve ser utilizado."
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild type="button" variant="outline">
              <Link
                href={
                  mode === "create"
                    ? "/armament-sizes"
                    : `/armament-sizes/${armamentSize?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar tamanho"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
