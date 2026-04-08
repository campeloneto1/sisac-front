"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateArmamentTypeMutation,
  useUpdateArmamentTypeMutation,
} from "@/hooks/use-armament-type-mutations";
import type {
  ArmamentTypeItem,
  CreateArmamentTypeDTO,
  UpdateArmamentTypeDTO,
} from "@/types/armament-type.type";
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

const armamentTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, "Informe o nome com ao menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  slug: z
    .string()
    .max(100, "O slug deve ter no máximo 100 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "O slug deve conter apenas letras minusculas, numeros e hifens.",
    )
    .or(z.literal("")),
  description: z
    .string()
    .max(5000, "A descrição deve ter no máximo 5000 caracteres."),
});

type ArmamentTypeFormValues = z.infer<typeof armamentTypeFormSchema>;

interface ArmamentTypeFormProps {
  mode: "create" | "edit";
  armamentType?: ArmamentTypeItem;
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

export function ArmamentTypeForm({
  mode,
  armamentType,
}: ArmamentTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreateArmamentTypeMutation();
  const updateMutation = useUpdateArmamentTypeMutation();
  const slugTouchedRef = useRef(Boolean(armamentType?.slug));

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ArmamentTypeFormValues>({
    resolver: zodResolver(armamentTypeFormSchema),
    defaultValues: {
      name: armamentType?.name ?? "",
      slug: armamentType?.slug ?? "",
      description: armamentType?.description ?? "",
    },
  });

  const watchedName = useWatch({ control, name: "name" });
  const watchedSlug = useWatch({ control, name: "slug" });

  useEffect(() => {
    if (!armamentType) {
      return;
    }

    slugTouchedRef.current = true;
    reset({
      name: armamentType.name,
      slug: armamentType.slug,
      description: armamentType.description ?? "",
    });
  }, [armamentType, reset]);

  useEffect(() => {
    if (slugTouchedRef.current) {
      return;
    }

    setValue("slug", slugify(watchedName ?? ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, watchedName]);

  async function onSubmit(values: ArmamentTypeFormValues) {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim() || null,
      description: values.description.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateArmamentTypeDTO,
      );
      router.push(`/armament-types/${response.data.id}`);
      return;
    }

    if (!armamentType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: armamentType.id,
      payload: payload satisfies UpdateArmamentTypeDTO,
    });
    router.push(`/armament-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo tipo de armamento"
            : "Editar tipo de armamento"}
        </CardTitle>
        <CardDescription>
          Cadastre as classificações usadas para organizar armamentos no
          sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="armament-type-name">Nome</Label>
              <Input
                id="armament-type-name"
                placeholder="Ex.: Pistola"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="armament-type-slug">Slug</Label>
              <Input
                id="armament-type-slug"
                placeholder="Ex.: pistola"
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
              <Label htmlFor="armament-type-description">Descrição</Label>
              <Textarea
                id="armament-type-description"
                placeholder="Descreva quando esse tipo deve ser usado."
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
                    ? "/armament-types"
                    : `/armament-types/${armamentType?.id}`
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
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
