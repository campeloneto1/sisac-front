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
  ArmamentControlType,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CONTROL_TYPE_OPTIONS: {
  value: ArmamentControlType;
  label: string;
  description: string;
}[] = [
  {
    value: "unit",
    label: "Unidade",
    description: "Controle individual por unidade (ex: armas de fogo)",
  },
  {
    value: "batch",
    label: "Lote",
    description: "Controle por lote/quantidade (ex: munição)",
  },
];

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
  control_type: z.enum(["unit", "batch"], {
    required_error: "Selecione o tipo de controle.",
  }),
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
      control_type: armamentType?.control_type ?? undefined,
    },
  });

  const watchedName = useWatch({ control, name: "name" });
  const watchedSlug = useWatch({ control, name: "slug" });
  const watchedControlType = useWatch({ control, name: "control_type" });

  useEffect(() => {
    if (!armamentType) {
      return;
    }

    slugTouchedRef.current = true;
    reset({
      name: armamentType.name,
      slug: armamentType.slug,
      description: armamentType.description ?? "",
      control_type: armamentType.control_type,
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
    if (mode === "create") {
      const payload: CreateArmamentTypeDTO = {
        name: values.name.trim(),
        slug: values.slug.trim() || null,
        description: values.description.trim() || null,
        control_type: values.control_type,
      };

      const response = await createMutation.mutateAsync(payload);
      router.push(`/armament-types/${response.data.id}`);
      return;
    }

    if (!armamentType) {
      return;
    }

    const payload: UpdateArmamentTypeDTO = {
      name: values.name.trim(),
      slug: values.slug.trim() || null,
      description: values.description.trim() || null,
      control_type: values.control_type,
    };

    const response = await updateMutation.mutateAsync({
      id: armamentType.id,
      payload,
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="armament-type-control-type">
                Tipo de controle *
              </Label>
              <Select
                value={watchedControlType}
                onValueChange={(value: ArmamentControlType) =>
                  setValue("control_type", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="armament-type-control-type">
                  <SelectValue placeholder="Selecione o tipo de controle" />
                </SelectTrigger>
                <SelectContent>
                  {CONTROL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-slate-500">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Define como os armamentos deste tipo serão controlados no
                estoque.
              </p>
              {errors.control_type ? (
                <p className="text-sm text-destructive">
                  {errors.control_type.message}
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
