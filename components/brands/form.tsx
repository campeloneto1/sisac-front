"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from "@/hooks/use-brand-mutations";
import {
  brandTypeOptions,
  type BrandItem,
  type BrandType,
  type CreateBrandDTO,
  type UpdateBrandDTO,
} from "@/types/brand.type";
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

const brandFormSchema = z.object({
  name: z
    .string()
    .min(2, "O nome precisa ter ao menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  abbreviation: z
    .string()
    .max(5, "A sigla deve ter no máximo 5 caracteres.")
    .optional()
    .or(z.literal("")),
  type: z.enum(["armament", "material", "vehicle"], {
    message: "Selecione um tipo válido.",
  }),
});

type BrandFormValues = z.infer<typeof brandFormSchema>;

interface BrandFormProps {
  mode: "create" | "edit";
  brand?: BrandItem;
}

export function BrandForm({ mode, brand }: BrandFormProps) {
  const router = useRouter();
  const createMutation = useCreateBrandMutation();
  const updateMutation = useUpdateBrandMutation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: brand?.name ?? "",
      abbreviation: brand?.abbreviation ?? "",
      type: brand?.type?.value ?? "armament",
    },
  });

  useEffect(() => {
    if (!brand) {
      return;
    }

    reset({
      name: brand.name,
      abbreviation: brand.abbreviation ?? "",
      type: brand.type.value,
    });
  }, [brand, reset]);

  async function onSubmit(values: BrandFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation?.trim()
        ? values.abbreviation.trim().toUpperCase()
        : null,
      type: values.type,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateBrandDTO,
      );
      router.push(`/brands/${response.data.id}`);
      return;
    }

    if (!brand) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: brand.id,
      payload: payloadBase satisfies UpdateBrandDTO,
    });
    router.push(`/brands/${response.data.id}`);
  }

  const selectedType = useWatch({
    control,
    name: "type",
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova marca" : "Editar marca"}
        </CardTitle>
        <CardDescription>
          Marcas ficam dentro de Administrador e servem de base para modelos e
          catalogos dependentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "edit" && (brand?.variants_count ?? 0) > 0 ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Esta marca possui modelos vinculadas. A exclusão fica bloqueada pela
            policy, entao altere com cuidado.
          </div>
        ) : null}

        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex.: Glock, Mercedes-Benz, CBC"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input
              id="abbreviation"
              maxLength={5}
              placeholder="Ex.: GLK"
              {...register("abbreviation")}
            />
            <p className="text-xs text-slate-500">
              Opcional. O backend salva automaticamente em caixa alta.
            </p>
            {errors.abbreviation ? (
              <p className="text-sm text-destructive">
                {errors.abbreviation.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                setValue("type", value as BrandType, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {brandTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Define em quais catalogos a marca podera ser reutilizada.
            </p>
            {errors.type ? (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link
                href={mode === "create" ? "/brands" : `/brands/${brand?.id}`}
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar marca"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
