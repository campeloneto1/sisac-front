"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useCreatePatrimonyMutation, useUpdatePatrimonyMutation } from "@/hooks/use-patrimony-mutations";
import { usePatrimonyTypes } from "@/hooks/use-patrimony-types";
import { useSectors } from "@/hooks/use-sectors";
import type {
  CreatePatrimonyDTO,
  PatrimonyItem,
  UpdatePatrimonyDTO,
} from "@/types/patrimony.type";
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

const patrimonyCreateSchema = z.object({
  patrimony_type_id: z.string().min(1, "Selecione o tipo de patrimônio."),
  current_sector_id: z.string(),
  serial_number: z.string().max(100).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  acquisition_date: z.string().optional().or(z.literal("")),
  acquisition_value: z.string().optional().or(z.literal("")),
  supplier: z.string().max(200).optional().or(z.literal("")),
  invoice_number: z.string().max(100).optional().or(z.literal("")),
});

const patrimonyEditSchema = patrimonyCreateSchema.omit({
  current_sector_id: true,
});

type PatrimonyCreateFormValues = z.infer<typeof patrimonyCreateSchema>;
type PatrimonyEditFormValues = z.infer<typeof patrimonyEditSchema>;

interface PatrimonyFormProps {
  mode: "create" | "edit";
  patrimony?: PatrimonyItem;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function parseOptionalCurrency(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  return Number(value.replace(",", "."));
}

export function PatrimonyForm({ mode, patrimony }: PatrimonyFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreatePatrimonyMutation();
  const updateMutation = useUpdatePatrimonyMutation();
  const isEnabled = Boolean(activeSubunit);
  const patrimonyTypesQuery = usePatrimonyTypes({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 }, isEnabled);

  const schema = mode === "create" ? patrimonyCreateSchema : patrimonyEditSchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PatrimonyCreateFormValues | PatrimonyEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patrimony_type_id: patrimony?.patrimony_type?.id
        ? String(patrimony.patrimony_type.id)
        : "",
      current_sector_id: patrimony?.current_sector?.id
        ? String(patrimony.current_sector.id)
        : "none",
      serial_number: patrimony?.serial_number ?? "",
      description: patrimony?.description ?? "",
      acquisition_date: formatDate(patrimony?.acquisition_date),
      acquisition_value:
        patrimony?.acquisition_value !== null &&
        patrimony?.acquisition_value !== undefined
          ? String(patrimony.acquisition_value)
          : "",
      supplier: patrimony?.supplier ?? "",
      invoice_number: patrimony?.invoice_number ?? "",
    },
  });

  const selectedPatrimonyTypeId = useWatch({
    control,
    name: "patrimony_type_id",
  });
  const selectedCurrentSectorId = useWatch({
    control,
    name: "current_sector_id" as never,
  });

  useEffect(() => {
    if (!patrimony) {
      return;
    }

    reset({
      patrimony_type_id: patrimony.patrimony_type?.id
        ? String(patrimony.patrimony_type.id)
        : "",
      current_sector_id: patrimony.current_sector?.id
        ? String(patrimony.current_sector.id)
        : "none",
      serial_number: patrimony.serial_number ?? "",
      description: patrimony.description ?? "",
      acquisition_date: formatDate(patrimony.acquisition_date),
      acquisition_value:
        patrimony.acquisition_value !== null &&
        patrimony.acquisition_value !== undefined
          ? String(patrimony.acquisition_value)
          : "",
      supplier: patrimony.supplier ?? "",
      invoice_number: patrimony.invoice_number ?? "",
    });
  }, [patrimony, reset]);

  async function onSubmit(
    values: PatrimonyCreateFormValues | PatrimonyEditFormValues,
  ) {
    if (!activeSubunit) {
      return;
    }

    if (mode === "create") {
      const createValues = values as PatrimonyCreateFormValues;

      const payload = {
        patrimony_type_id: Number(createValues.patrimony_type_id),
        current_sector_id:
          createValues.current_sector_id !== "none"
            ? Number(createValues.current_sector_id)
            : null,
        serial_number: createValues.serial_number?.trim() || null,
        description: createValues.description?.trim() || null,
        acquisition_date: createValues.acquisition_date || null,
        acquisition_value: parseOptionalCurrency(createValues.acquisition_value),
        supplier: createValues.supplier?.trim() || null,
        invoice_number: createValues.invoice_number?.trim() || null,
      } satisfies CreatePatrimonyDTO;

      const response = await createMutation.mutateAsync(payload);
      router.push(`/patrimonies/${response.data.id}`);
      return;
    }

    if (!patrimony) {
      return;
    }

    const editValues = values as PatrimonyEditFormValues;

    const payload = {
      patrimony_type_id: Number(editValues.patrimony_type_id),
      serial_number: editValues.serial_number?.trim() || null,
      description: editValues.description?.trim() || null,
      acquisition_date: editValues.acquisition_date || null,
      acquisition_value: parseOptionalCurrency(editValues.acquisition_value),
      supplier: editValues.supplier?.trim() || null,
      invoice_number: editValues.invoice_number?.trim() || null,
    } satisfies UpdatePatrimonyDTO;

    const response = await updateMutation.mutateAsync({
      id: patrimony.id,
      payload,
    });
    router.push(`/patrimonies/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo patrimônio" : "Editar patrimônio"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Cadastre um patrimônio na subunidade ativa. O codigo e o status inicial sao definidos pela API."
            : "Atualize os dados cadastrais do patrimônio. Transferências e baixas possuem fluxos próprios."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activeSubunit ? (
          <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Selecione uma subunidade ativa antes de cadastrar ou editar patrimônios.
          </div>
        ) : null}

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo de patrimônio</Label>
              <Select
                value={selectedPatrimonyTypeId || "none"}
                onValueChange={(value) =>
                  setValue("patrimony_type_id", value === "none" ? "" : value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o tipo</SelectItem>
                  {(patrimonyTypesQuery.data?.data ?? []).map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {"patrimony_type_id" in errors && errors.patrimony_type_id ? (
                <p className="text-sm text-destructive">
                  {errors.patrimony_type_id.message}
                </p>
              ) : null}
            </div>

            {mode === "create" ? (
              <div className="space-y-2">
                <Label>Setor inicial</Label>
                <Select
                  value={(selectedCurrentSectorId as string) || "none"}
                  onValueChange={(value) =>
                    setValue("current_sector_id" as never, value as never, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem setor inicial</SelectItem>
                    {(sectorsQuery.data?.data ?? []).map((sector) => (
                      <SelectItem key={sector.id} value={String(sector.id)}>
                        {sector.abbreviation
                          ? `${sector.abbreviation} • ${sector.name}`
                          : sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Se informado, a API cria automaticamente o primeiro evento no histórico setorial.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="serial_number">Número de serie</Label>
              <Input id="serial_number" {...register("serial_number")} />
              {"serial_number" in errors && errors.serial_number ? (
                <p className="text-sm text-destructive">
                  {errors.serial_number.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisition_date">Data de aquisicao</Label>
              <Input id="acquisition_date" type="date" {...register("acquisition_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisition_value">Valor de aquisicao</Label>
              <Input
                id="acquisition_value"
                type="number"
                step="0.01"
                min={0}
                {...register("acquisition_value")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input id="supplier" {...register("supplier")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_number">Nota fiscal</Label>
              <Input id="invoice_number" {...register("invoice_number")} />
            </div>

            <div className="space-y-2 md:col-span-2 xl:col-span-3">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Descreva o patrimônio, características e observações relevantes."
                {...register("description")}
              />
              {"description" in errors && errors.description ? (
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
                    ? "/patrimonies"
                    : `/patrimonies/${patrimony?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar patrimônio"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
