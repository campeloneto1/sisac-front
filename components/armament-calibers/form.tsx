"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateArmamentCaliberMutation,
  useUpdateArmamentCaliberMutation,
} from "@/hooks/use-armament-caliber-mutations";
import type {
  ArmamentCaliberItem,
  CreateArmamentCaliberDTO,
  UpdateArmamentCaliberDTO,
} from "@/types/armament-caliber.type";
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

const armamentCaliberFormSchema = z.object({
  name: z
    .string()
    .min(2, "Informe o nome com ao menos 2 caracteres.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  slug: z
    .string()
    .max(50, "O slug deve ter no máximo 50 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "O slug deve conter apenas letras minusculas, numeros e hifens.",
    )
    .or(z.literal("")),
  description: z
    .string()
    .max(5000, "A descrição deve ter no máximo 5000 caracteres."),
});

type ArmamentCaliberFormValues = z.infer<typeof armamentCaliberFormSchema>;

interface ArmamentCaliberFormProps {
  mode: "create" | "edit";
  armamentCaliber?: ArmamentCaliberItem;
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

export function ArmamentCaliberForm({
  mode,
  armamentCaliber,
}: ArmamentCaliberFormProps) {
  const router = useRouter();
  const createMutation = useCreateArmamentCaliberMutation();
  const updateMutation = useUpdateArmamentCaliberMutation();
  const slugTouchedRef = useRef(Boolean(armamentCaliber?.slug));

  const {
    register,
    reset,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ArmamentCaliberFormValues>({
    resolver: zodResolver(armamentCaliberFormSchema),
    defaultValues: {
      name: armamentCaliber?.name ?? "",
      slug: armamentCaliber?.slug ?? "",
      description: armamentCaliber?.description ?? "",
    },
  });

  const watchedName = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!armamentCaliber) {
      return;
    }

    slugTouchedRef.current = true;
    reset({
      name: armamentCaliber.name,
      slug: armamentCaliber.slug,
      description: armamentCaliber.description ?? "",
    });
  }, [armamentCaliber, reset]);

  useEffect(() => {
    if (slugTouchedRef.current) {
      return;
    }

    setValue("slug", slugify(watchedName ?? ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, watchedName]);

  async function onSubmit(values: ArmamentCaliberFormValues) {
    const payload = {
      name: values.name.trim(),
      slug: values.slug.trim() || null,
      description: values.description.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateArmamentCaliberDTO,
      );
      router.push(`/armament-calibers/${response.data.id}`);
      return;
    }

    if (!armamentCaliber) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: armamentCaliber.id,
      payload: payload satisfies UpdateArmamentCaliberDTO,
    });
    router.push(`/armament-calibers/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo calibre de armamento"
            : "Editar calibre de armamento"}
        </CardTitle>
        <CardDescription>
          Cadastre os calibres usados para classificar armamentos no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="armament-caliber-name">Nome *</Label>
              <Input
                id="armament-caliber-name"
                placeholder="Ex.: 9mm"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="armament-caliber-slug">Slug</Label>
              <Input
                id="armament-caliber-slug"
                placeholder="Ex.: 9mm"
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
              <Label htmlFor="armament-caliber-description">Descrição</Label>
              <Textarea
                id="armament-caliber-description"
                placeholder="Explique quando esse calibre deve ser utilizado."
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
                    ? "/armament-calibers"
                    : `/armament-calibers/${armamentCaliber?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar calibre"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
