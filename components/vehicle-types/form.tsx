"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVehicleTypeMutation,
  useUpdateVehicleTypeMutation,
} from "@/hooks/use-vehicle-type-mutations";
import type {
  CreateVehicleTypeDTO,
  UpdateVehicleTypeDTO,
  VehicleTypeItem,
} from "@/types/vehicle-type.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const vehicleTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(100, "O nome deve ter no maximo 100 caracteres."),
  slug: z
    .string()
    .min(2, "O slug precisa ter ao menos 2 caracteres.")
    .max(100, "O slug deve ter no maximo 100 caracteres."),
  code: z
    .string()
    .min(2, "O codigo precisa ter ao menos 2 caracteres.")
    .max(50, "O codigo deve ter no maximo 50 caracteres.")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

type VehicleTypeFormValues = z.infer<typeof vehicleTypeFormSchema>;

interface VehicleTypeFormProps {
  mode: "create" | "edit";
  vehicleType?: VehicleTypeItem;
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

export function VehicleTypeForm({
  mode,
  vehicleType,
}: VehicleTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleTypeMutation();
  const updateMutation = useUpdateVehicleTypeMutation();
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<VehicleTypeFormValues>({
    resolver: zodResolver(vehicleTypeFormSchema),
    defaultValues: {
      name: vehicleType?.name ?? "",
      slug: vehicleType?.slug ?? "",
      code: vehicleType?.code ?? "",
      is_active: vehicleType?.is_active ?? true,
    },
  });

  const nameField = register("name");
  const slugField = register("slug");
  const watchedName = useWatch({
    control,
    name: "name",
  });
  const isActive = useWatch({
    control,
    name: "is_active",
  });

  useEffect(() => {
    if (!vehicleType) {
      return;
    }

    reset({
      name: vehicleType.name,
      slug: vehicleType.slug,
      code: vehicleType.code ?? "",
      is_active: vehicleType.is_active,
    });
    setAutoSlug(false);
  }, [vehicleType, reset]);

  useEffect(() => {
    if (!autoSlug || mode !== "create") {
      return;
    }

    setValue("slug", slugify(watchedName || ""), {
      shouldValidate: Boolean(watchedName),
      shouldDirty: false,
    });
  }, [autoSlug, mode, setValue, watchedName]);

  async function onSubmit(values: VehicleTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: slugify(values.slug),
      code: values.code?.trim() ? values.code.trim().toUpperCase() : null,
      is_active: values.is_active,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateVehicleTypeDTO,
      );
      router.push(`/vehicle-types/${response.data.id}`);
      return;
    }

    if (!vehicleType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: vehicleType.id,
      payload: payloadBase satisfies UpdateVehicleTypeDTO,
    });
    router.push(`/vehicle-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo tipo de veiculo" : "Editar tipo de veiculo"}
        </CardTitle>
        <CardDescription>
          Tipos de veiculo ficam em Administrador e organizam classificacoes
          mestres usadas por cadastros dependentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Sedan, SUV, Motocicleta, Caminhonete"
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
                placeholder="Ex.: sedan"
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

            <div className="space-y-2">
              <Label htmlFor="code">Codigo</Label>
              <Input
                id="code"
                placeholder="Ex.: SUV, MOTO, CAMINHONETE"
                {...register("code")}
              />
              <p className="text-xs text-slate-500">
                Opcional. O backend salva automaticamente em caixa alta.
              </p>
              {errors.code ? (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              ) : null}
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 md:col-span-2">
              <Checkbox
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("is_active", checked === true, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-slate-900">
                  Tipo ativo
                </span>
                <span className="block text-sm text-slate-500">
                  Tipos inativos podem ser mantidos por historico sem aparecer em
                  novos fluxos administrativos.
                </span>
              </span>
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create"
                    ? "/vehicle-types"
                    : `/vehicle-types/${vehicleType?.id}`
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
