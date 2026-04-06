"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateVariantMutation, useUpdateVariantMutation } from "@/hooks/use-variant-mutations";
import { useVariantBrands } from "@/hooks/use-variants";
import type { CreateVariantDTO, UpdateVariantDTO, VariantItem } from "@/types/variant.type";
import { getBrandTypeLabel } from "@/types/brand.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const variantFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
  abbreviation: z.string().max(5, "A sigla deve ter no maximo 5 caracteres.").optional().or(z.literal("")),
  brand_id: z.string(),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface VariantFormProps {
  mode: "create" | "edit";
  variant?: VariantItem;
}

export function VariantForm({ mode, variant }: VariantFormProps) {
  const router = useRouter();
  const createMutation = useCreateVariantMutation();
  const updateMutation = useUpdateVariantMutation();
  const brandsQuery = useVariantBrands();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: variant?.name ?? "",
      abbreviation: variant?.abbreviation ?? "",
      brand_id: variant?.brand_id ? String(variant.brand_id) : "none",
    },
  });

  useEffect(() => {
    if (!variant) {
      return;
    }

    reset({
      name: variant.name,
      abbreviation: variant.abbreviation ?? "",
      brand_id: variant.brand_id ? String(variant.brand_id) : "none",
    });
  }, [reset, variant]);

  async function onSubmit(values: VariantFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      abbreviation: values.abbreviation?.trim() ? values.abbreviation.trim().toUpperCase() : null,
      brand_id: values.brand_id !== "none" ? Number(values.brand_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateVariantDTO);
      router.push(`/variants/${response.data.id}`);
      return;
    }

    if (!variant) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: variant.id,
      payload: payloadBase satisfies UpdateVariantDTO,
    });
    router.push(`/variants/${response.data.id}`);
  }

  const selectedBrandId = useWatch({
    control,
    name: "brand_id",
  });
  const selectedBrand = (brandsQuery.data?.data ?? []).find((brand) => String(brand.id) === selectedBrandId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova variante" : "Editar variante"}</CardTitle>
        <CardDescription>
          Variantes ficam dentro de Administrador e se vinculam a uma marca para compor os catalogos do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Glock 17, Actros, Ranger" {...register("name")} />
            <p className="text-xs text-slate-500">O backend valida unicidade por marca. Duas marcas diferentes podem ter o mesmo nome.</p>
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Sigla</Label>
            <Input id="abbreviation" maxLength={5} placeholder="Ex.: G17" {...register("abbreviation")} />
            <p className="text-xs text-slate-500">Opcional. O backend salva automaticamente em caixa alta.</p>
            {errors.abbreviation ? <p className="text-sm text-destructive">{errors.abbreviation.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Marca</Label>
            <Select value={selectedBrandId} onValueChange={(value) => setValue("brand_id", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem marca vinculada</SelectItem>
                {(brandsQuery.data?.data ?? []).map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name} • {getBrandTypeLabel(brand.type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {selectedBrand
                ? `Marca selecionada: ${selectedBrand.name} (${getBrandTypeLabel(selectedBrand.type)}).`
                : "Selecione uma marca para contextualizar a variante no catalogo."}
            </p>
            {errors.brand_id ? <p className="text-sm text-destructive">{errors.brand_id.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/variants" : `/variants/${variant?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar variante" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
