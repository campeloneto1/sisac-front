"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  useCreateArmamentUnitMutation,
  useUpdateArmamentUnitMutation,
} from "@/hooks/use-armament-unit-mutations";
import type {
  ArmamentUnitItem,
  CreateArmamentUnitDTO,
  UpdateArmamentUnitDTO,
} from "@/types/armament-unit.type";
import { armamentUnitStatusOptions } from "@/types/armament-unit.type";
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

const formSchema = z
  .object({
    serial_number: z.string().trim().max(100, "O número de série deve ter no máximo 100 caracteres.").optional(),
    acquisition_date: z.string().optional(),
    expiration_date: z.string().optional(),
    status: z.enum(
      armamentUnitStatusOptions.map((option) => option.value) as [
        (typeof armamentUnitStatusOptions)[number]["value"],
        ...(typeof armamentUnitStatusOptions)[number]["value"][],
      ],
    ),
  })
  .superRefine((values, context) => {
    if (
      values.acquisition_date &&
      values.expiration_date &&
      values.expiration_date < values.acquisition_date
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A data de expiração deve ser igual ou posterior à data de aquisição.",
        path: ["expiration_date"],
      });
    }
  });

type ArmamentUnitFormValues = z.infer<typeof formSchema>;

interface ArmamentUnitFormProps {
  armamentId: number | string;
  mode: "create" | "edit";
  unit?: ArmamentUnitItem;
}

function toNullableString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function ArmamentUnitForm({
  armamentId,
  mode,
  unit,
}: ArmamentUnitFormProps) {
  const router = useRouter();
  const createMutation = useCreateArmamentUnitMutation(armamentId);
  const updateMutation = useUpdateArmamentUnitMutation(armamentId);
  const form = useForm<ArmamentUnitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serial_number: unit?.serial_number ?? "",
      acquisition_date: unit?.acquisition_date ?? "",
      expiration_date: unit?.expiration_date ?? "",
      status: unit?.status?.value ?? "available",
    },
  });
  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  });

  async function onSubmit(values: ArmamentUnitFormValues) {
    const payload = {
      serial_number: toNullableString(values.serial_number),
      acquisition_date: toNullableString(values.acquisition_date),
      expiration_date: toNullableString(values.expiration_date),
      status: values.status,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateArmamentUnitDTO,
      );
      router.push(`/armaments/${armamentId}/units/${response.data.id}`);
      return;
    }

    if (!unit) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      unitId: unit.id,
      payload: payload satisfies UpdateArmamentUnitDTO,
    });
    router.push(`/armaments/${armamentId}/units/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova unidade" : `Editar unidade #${unit?.id ?? ""}`}
        </CardTitle>
        <CardDescription>
          Registre os dados operacionais da unidade física vinculada a este armamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serial_number">Número de série</Label>
              <Input
                id="serial_number"
                placeholder="Ex.: PT-2026-0001"
                {...form.register("serial_number")}
              />
              {form.formState.errors.serial_number ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.serial_number.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  form.setValue("status", value as ArmamentUnitFormValues["status"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {armamentUnitStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisition_date">Data de aquisição</Label>
              <Input
                id="acquisition_date"
                type="date"
                {...form.register("acquisition_date")}
              />
              {form.formState.errors.acquisition_date ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.acquisition_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration_date">Data de expiração</Label>
              <Input
                id="expiration_date"
                type="date"
                {...form.register("expiration_date")}
              />
              {form.formState.errors.expiration_date ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.expiration_date.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="outline">
              <Link href={`/armaments/${armamentId}/units`}>
                Cancelar
              </Link>
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending
                ? mode === "create"
                  ? "Salvando..."
                  : "Atualizando..."
                : mode === "create"
                  ? "Cadastrar unidade"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
