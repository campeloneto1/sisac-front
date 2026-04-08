"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateMaterialTypeMutation,
  useUpdateMaterialTypeMutation,
} from "@/hooks/use-material-type-mutations";
import type {
  CreateMaterialTypeDTO,
  MaterialTypeItem,
  UpdateMaterialTypeDTO,
} from "@/types/material-type.type";
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

const materialTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  slug: z
    .string()
    .min(2, "O slug precisa ter ao menos 2 caracteres.")
    .max(100, "O slug deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
});

type MaterialTypeFormValues = z.infer<typeof materialTypeFormSchema>;

interface MaterialTypeFormProps {
  mode: "create" | "edit";
  materialType?: MaterialTypeItem;
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

export function MaterialTypeForm({
  mode,
  materialType,
}: MaterialTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreateMaterialTypeMutation();
  const updateMutation = useUpdateMaterialTypeMutation();
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<MaterialTypeFormValues>({
    resolver: zodResolver(materialTypeFormSchema),
    defaultValues: {
      name: materialType?.name ?? "",
      slug: materialType?.slug ?? "",
      description: materialType?.description ?? "",
    },
  });

  const nameField = register("name");
  const slugField = register("slug");
  const watchedName = useWatch({
    control,
    name: "name",
  });

  useEffect(() => {
    if (!materialType) {
      return;
    }

    reset({
      name: materialType.name,
      slug: materialType.slug,
      description: materialType.description ?? "",
    });
  }, [materialType, reset]);

  useEffect(() => {
    if (!autoSlug || mode !== "create") {
      return;
    }

    setValue("slug", slugify(watchedName || ""), {
      shouldValidate: Boolean(watchedName),
      shouldDirty: false,
    });
  }, [autoSlug, mode, setValue, watchedName]);

  async function onSubmit(values: MaterialTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: slugify(values.slug),
      description: values.description?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateMaterialTypeDTO,
      );
      router.push(`/material-types/${response.data.id}`);
      return;
    }

    if (!materialType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: materialType.id,
      payload: payloadBase satisfies UpdateMaterialTypeDTO,
    });
    router.push(`/material-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo tipo de material" : "Editar tipo de material"}
        </CardTitle>
        <CardDescription>
          Tipos de material ficam em Administrador e sustentam a classificação
          mestre usada pelo módulo de materiais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Expediente, Informatica, Uniforme, Ferramenta"
                {...nameField}
                onChange={(event) => {
                  nameField.onChange(event);
                }}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="Ex.: expediente"
                {...slugField}
                onChange={(event) => {
                  setAutoSlug(false);
                  slugField.onChange(event);
                }}
              />
              <p className="text-xs text-slate-500">
                No create o slug e sugerido a partir do nome, mas continua
                editavel.
              </p>
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Descreva como esse tipo deve ser usado na classificação administrativa dos materiais."
                {...register("description")}
              />
              <p className="text-xs text-slate-500">
                Campo opcional para orientar o uso do cadastro no dominio de
                materiais.
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
                    ? "/material-types"
                    : `/material-types/${materialType?.id}`
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
