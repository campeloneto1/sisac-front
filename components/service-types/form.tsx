"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
} from "@/hooks/use-service-type-mutations";
import type {
  CreateServiceTypeDTO,
  ServiceTypeItem,
  UpdateServiceTypeDTO,
} from "@/types/service-type.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const serviceTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  code: z
    .string()
    .min(2, "O codigo precisa ter ao menos 2 caracteres.")
    .max(50, "O codigo deve ter no máximo 50 caracteres."),
  description: z
    .string()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
    .optional()
    .or(z.literal("")),
  active: z.boolean(),
  requires_approval: z.boolean(),
  estimated_duration_hours: z.union([
    z.literal(""),
    z
      .number()
      .int("A duracao estimada deve ser inteira.")
      .min(1, "A duracao estimada deve ser de no mínimo 1 hora.")
      .max(1000, "A duracao estimada deve ser de no máximo 1000 horas."),
  ]),
});

type ServiceTypeFormValues = z.infer<typeof serviceTypeFormSchema>;

interface ServiceTypeFormProps {
  mode: "create" | "edit";
  serviceType?: ServiceTypeItem;
}

function codeify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServiceTypeForm({ mode, serviceType }: ServiceTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreateServiceTypeMutation();
  const updateMutation = useUpdateServiceTypeMutation();
  const [autoCode, setAutoCode] = useState(mode === "create");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ServiceTypeFormValues>({
    resolver: zodResolver(serviceTypeFormSchema),
    defaultValues: {
      name: serviceType?.name ?? "",
      code: serviceType?.code ?? "",
      description: serviceType?.description ?? "",
      active: serviceType?.active ?? true,
      requires_approval: serviceType?.requires_approval ?? false,
      estimated_duration_hours: serviceType?.estimated_duration_hours ?? "",
    },
  });

  const nameField = register("name");
  const codeField = register("code");
  const watchedName = useWatch({ control, name: "name" });
  const watchedActive = useWatch({ control, name: "active" });
  const watchedRequiresApproval = useWatch({
    control,
    name: "requires_approval",
  });

  useEffect(() => {
    if (!serviceType) {
      return;
    }

    reset({
      name: serviceType.name,
      code: serviceType.code,
      description: serviceType.description ?? "",
      active: serviceType.active,
      requires_approval: serviceType.requires_approval,
      estimated_duration_hours: serviceType.estimated_duration_hours ?? "",
    });
  }, [serviceType, reset]);

  useEffect(() => {
    if (!autoCode || mode !== "create") {
      return;
    }

    setValue("code", codeify(watchedName || ""), {
      shouldValidate: Boolean(watchedName),
      shouldDirty: false,
    });
  }, [autoCode, mode, setValue, watchedName]);

  async function onSubmit(values: ServiceTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      code: codeify(values.code),
      description: values.description?.trim() || null,
      active: values.active,
      requires_approval: values.requires_approval,
      estimated_duration_hours:
        values.estimated_duration_hours === ""
          ? null
          : Number(values.estimated_duration_hours),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateServiceTypeDTO,
      );
      router.push(`/service-types/${response.data.id}`);
      return;
    }

    if (!serviceType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: serviceType.id,
      payload: payloadBase satisfies UpdateServiceTypeDTO,
    });
    router.push(`/service-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo tipo de serviço" : "Editar tipo de serviço"}
        </CardTitle>
        <CardDescription>
          Tipos de serviço ficam em Administrador e sustentam o cadastro mestre
          usado pelos serviços do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Manutenção corretiva, Visita técnica, Atendimento"
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
              <Label htmlFor="code">Codigo</Label>
              <Input
                id="code"
                placeholder="Ex.: manutenção-corretiva"
                {...codeField}
                onChange={(event) => {
                  setAutoCode(false);
                  codeField.onChange(event);
                }}
              />
              <p className="text-xs text-slate-500">
                No create o codigo e sugerido a partir do nome, mas continua editavel.
              </p>
              {errors.code ? (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration_hours">Duracao estimada em horas</Label>
              <Input
                id="estimated_duration_hours"
                type="number"
                min={1}
                max={1000}
                placeholder="Opcional"
                {...register("estimated_duration_hours")}
              />
              {errors.estimated_duration_hours ? (
                <p className="text-sm text-destructive">
                  {errors.estimated_duration_hours.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Descreva como esse tipo deve ser usado no catalogo administrativo de serviços."
                {...register("description")}
              />
              <p className="text-xs text-slate-500">
                Campo opcional para orientar o uso do cadastro no dominio de serviços.
              </p>
              {errors.description ? (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="active"
                  checked={watchedActive}
                  onCheckedChange={(checked) =>
                    setValue("active", checked === true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="active">Tipo ativo</Label>
                  <p className="text-sm text-slate-500">
                    Quando ativo, o tipo pode ser usado normalmente nos fluxos de serviço.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="requires_approval"
                  checked={watchedRequiresApproval}
                  onCheckedChange={(checked) =>
                    setValue("requires_approval", checked === true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="requires_approval">Requer aprovacao</Label>
                  <p className="text-sm text-slate-500">
                    Indica que os serviços deste tipo devem seguir fluxo de aprovacao.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create"
                    ? "/service-types"
                    : `/service-types/${serviceType?.id}`
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
