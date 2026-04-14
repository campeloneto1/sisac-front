"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCreateArmamentBatchMutation,
  useUpdateArmamentBatchMutation,
} from "@/hooks/use-armament-batch-mutations";
import type {
  ArmamentBatchItem,
  CreateArmamentBatchDTO,
  UpdateArmamentBatchDTO,
} from "@/types/armament-batch.type";
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

const formSchema = z.object({
  batch_number: z
    .string()
    .trim()
    .min(2, "O número do lote deve ter no mínimo 2 caracteres.")
    .max(100, "O número do lote deve ter no máximo 100 caracteres."),
  quantity: z
    .number()
    .int("A quantidade deve ser um número inteiro.")
    .min(1, "A quantidade deve ser no mínimo 1."),
  expiration_date: z.string().optional(),
});

type ArmamentBatchFormValues = z.infer<typeof formSchema>;

interface ArmamentBatchFormProps {
  armamentId: number | string;
  mode: "create" | "edit";
  batch?: ArmamentBatchItem;
}

function toNullableString(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function ArmamentBatchForm({
  armamentId,
  mode,
  batch,
}: ArmamentBatchFormProps) {
  const router = useRouter();
  const createMutation = useCreateArmamentBatchMutation();
  const updateMutation = useUpdateArmamentBatchMutation();
  const form = useForm<ArmamentBatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batch_number: batch?.batch_number ?? "",
      quantity: batch?.quantity ?? 1,
      expiration_date: batch?.expiration_date ?? "",
    },
  });

  async function onSubmit(values: ArmamentBatchFormValues) {
    if (mode === "create") {
      const payload: CreateArmamentBatchDTO = {
        armament_id: Number(armamentId),
        batch_number: values.batch_number,
        quantity: values.quantity,
        expiration_date: toNullableString(values.expiration_date),
      };

      const response = await createMutation.mutateAsync(payload);
      router.push(`/armaments/${armamentId}/batches/${response.data.id}`);
      return;
    }

    if (!batch) {
      return;
    }

    const payload: UpdateArmamentBatchDTO = {
      batch_number: values.batch_number,
      quantity: values.quantity,
      expiration_date: toNullableString(values.expiration_date),
    };

    const response = await updateMutation.mutateAsync({
      batchId: batch.id,
      payload,
    });
    router.push(`/armaments/${armamentId}/batches/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo lote" : `Editar lote #${batch?.id ?? ""}`}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Registre um novo lote vinculado a este armamento."
            : "Atualize os dados do lote vinculado a este armamento."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="batch_number">Número do lote *</Label>
              <Input
                id="batch_number"
                placeholder="Ex.: LOTE-2026-001"
                {...form.register("batch_number")}
              />
              {form.formState.errors.batch_number ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.batch_number.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade total *</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                placeholder="Ex.: 100"
                {...form.register("quantity")}
              />
              {form.formState.errors.quantity ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.quantity.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2 md:max-w-xs">
              <Label htmlFor="expiration_date">Data de validade</Label>
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
              <p className="text-xs text-slate-500">
                Deixe em branco se o lote não possuir validade.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="outline">
              <Link href={`/armaments/${armamentId}/batches`}>Cancelar</Link>
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending
                ? mode === "create"
                  ? "Salvando..."
                  : "Atualizando..."
                : mode === "create"
                  ? "Cadastrar lote"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
