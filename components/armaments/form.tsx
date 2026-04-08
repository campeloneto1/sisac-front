"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateArmamentMutation,
  useUpdateArmamentMutation,
} from "@/hooks/use-armament-mutations";
import { useSubunit } from "@/contexts/subunit-context";
import { useBrands } from "@/hooks/use-brands";
import { useArmamentCalibers } from "@/hooks/use-armament-calibers";
import { useArmamentSizes } from "@/hooks/use-armament-sizes";
import { useArmamentTypes } from "@/hooks/use-armament-types";
import { useGenders } from "@/hooks/use-genders";
import { useVariants } from "@/hooks/use-variants";
import type {
  ArmamentItem,
  ArmamentSpecifications,
  CreateArmamentDTO,
  UpdateArmamentDTO,
} from "@/types/armament.type";
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

const specificationRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const armamentFormSchema = z.object({
  armament_type_id: z.string().min(1, "Selecione o tipo de armamento."),
  brand_id: z.string().min(1, "Selecione a marca."),
  variant_id: z.string().min(1, "Selecione a variante."),
  armament_caliber_id: z.string(),
  armament_size_id: z.string(),
  gender_id: z.string(),
  specifications_rows: z.array(specificationRowSchema),
});

type ArmamentFormValues = z.infer<typeof armamentFormSchema>;

interface ArmamentFormProps {
  mode: "create" | "edit";
  armament?: ArmamentItem;
}

function specificationRowsFromRecord(
  specifications?: ArmamentSpecifications | null,
) {
  const entries = Object.entries(specifications ?? {});

  if (!entries.length) {
    return [{ key: "", value: "" }];
  }

  return entries.map(([key, value]) => ({
    key,
    value,
  }));
}

function specificationRecordFromRows(rows: { key: string; value: string }[]) {
  const record: ArmamentSpecifications = {};

  rows.forEach((row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (key && value) {
      record[key] = value;
    }
  });

  return Object.keys(record).length ? record : null;
}

export function ArmamentForm({ mode, armament }: ArmamentFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateArmamentMutation();
  const updateMutation = useUpdateArmamentMutation();
  const typesQuery = useArmamentTypes({ per_page: 100 });
  const brandsQuery = useBrands({ per_page: 100, type: "weapon" });
  const calibersQuery = useArmamentCalibers({ per_page: 100 });
  const sizesQuery = useArmamentSizes({ per_page: 100 });
  const gendersQuery = useGenders({ per_page: 100 });

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ArmamentFormValues>({
    resolver: zodResolver(armamentFormSchema),
    defaultValues: {
      armament_type_id: armament?.armament_type_id
        ? String(armament.armament_type_id)
        : "",
      brand_id: armament?.variant?.brand_id ? String(armament.variant.brand_id) : "",
      variant_id: armament?.variant_id ? String(armament.variant_id) : "",
      armament_caliber_id: armament?.armament_caliber_id
        ? String(armament.armament_caliber_id)
        : "none",
      armament_size_id: armament?.armament_size_id
        ? String(armament.armament_size_id)
        : "none",
      gender_id: armament?.gender_id ? String(armament.gender_id) : "none",
      specifications_rows: specificationRowsFromRecord(armament?.specifications),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications_rows",
  });

  const selectedTypeId = useWatch({ control, name: "armament_type_id" });
  const selectedBrandId = useWatch({ control, name: "brand_id" });
  const selectedVariantId = useWatch({ control, name: "variant_id" });
  const selectedCaliberId = useWatch({ control, name: "armament_caliber_id" });
  const selectedSizeId = useWatch({ control, name: "armament_size_id" });
  const selectedGenderId = useWatch({ control, name: "gender_id" });
  const variantsQuery = useVariants(
    {
      per_page: 100,
      brand_id: selectedBrandId ? Number(selectedBrandId) : null,
    },
    Boolean(selectedBrandId),
  );

  useEffect(() => {
    if (!armament) {
      return;
    }

    reset({
      armament_type_id: String(armament.armament_type_id),
      brand_id: armament.variant?.brand_id ? String(armament.variant.brand_id) : "",
      variant_id: String(armament.variant_id),
      armament_caliber_id: armament.armament_caliber_id
        ? String(armament.armament_caliber_id)
        : "none",
      armament_size_id: armament.armament_size_id
        ? String(armament.armament_size_id)
        : "none",
      gender_id: armament.gender_id ? String(armament.gender_id) : "none",
      specifications_rows: specificationRowsFromRecord(armament.specifications),
    });
  }, [armament, reset]);

  async function onSubmit(values: ArmamentFormValues) {
    if (!activeSubunit) {
      return;
    }

    const payload = {
      armament_type_id: Number(values.armament_type_id),
      variant_id: Number(values.variant_id),
      armament_caliber_id:
        values.armament_caliber_id !== "none"
          ? Number(values.armament_caliber_id)
          : null,
      armament_size_id:
        values.armament_size_id !== "none"
          ? Number(values.armament_size_id)
          : null,
      gender_id:
        values.gender_id !== "none" ? Number(values.gender_id) : null,
      specifications: specificationRecordFromRows(values.specifications_rows),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateArmamentDTO,
      );
      router.push(`/armaments/${response.data.id}`);
      return;
    }

    if (!armament) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: armament.id,
      payload: payload satisfies UpdateArmamentDTO,
    });
    router.push(`/armaments/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo armamento" : "Editar armamento"}
        </CardTitle>
        <CardDescription>
          Cadastre o armamento base e suas classificacoes tecnicas para uso
          operacional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Subunidade ativa:{" "}
          <span className="font-medium text-slate-900">
            {activeSubunit?.abbreviation || activeSubunit?.name || "Nao selecionada"}
          </span>
        </div>

        {!activeSubunit ? (
          <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Selecione uma subunidade ativa antes de cadastrar ou editar armamentos.
          </div>
        ) : null}

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={selectedTypeId || "none"}
                onValueChange={(value) =>
                  setValue("armament_type_id", value === "none" ? "" : value, {
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
                  {(typesQuery.data?.data ?? []).map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.armament_type_id ? (
                <p className="text-sm text-destructive">
                  {errors.armament_type_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Select
                value={selectedBrandId || "none"}
                onValueChange={(value) => {
                  const nextBrandId = value === "none" ? "" : value;

                  setValue("brand_id", nextBrandId, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("variant_id", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione a marca</SelectItem>
                  {(brandsQuery.data?.data ?? []).map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>
                      {brand.abbreviation ? `${brand.name} (${brand.abbreviation})` : brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand_id ? (
                <p className="text-sm text-destructive">
                  {errors.brand_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Variante</Label>
              <Select
                value={selectedVariantId || "none"}
                disabled={!selectedBrandId}
                onValueChange={(value) =>
                  setValue("variant_id", value === "none" ? "" : value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedBrandId ? "Selecione a variante" : "Selecione uma marca primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione a variante</SelectItem>
                  {(variantsQuery.data?.data ?? []).map((variant) => (
                    <SelectItem key={variant.id} value={String(variant.id)}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.variant_id ? (
                <p className="text-sm text-destructive">
                  {errors.variant_id.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Calibre</Label>
              <Select
                value={selectedCaliberId || "none"}
                onValueChange={(value) =>
                  setValue("armament_caliber_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o calibre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem calibre</SelectItem>
                  {(calibersQuery.data?.data ?? []).map((caliber) => (
                    <SelectItem key={caliber.id} value={String(caliber.id)}>
                      {caliber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho</Label>
              <Select
                value={selectedSizeId || "none"}
                onValueChange={(value) =>
                  setValue("armament_size_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tamanho</SelectItem>
                  {(sizesQuery.data?.data ?? []).map((size) => (
                    <SelectItem key={size.id} value={String(size.id)}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Genero</Label>
              <Select
                value={selectedGenderId || "none"}
                onValueChange={(value) =>
                  setValue("gender_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o genero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem genero</SelectItem>
                  {(gendersQuery.data?.data ?? []).map((gender) => (
                    <SelectItem key={gender.id} value={String(gender.id)}>
                      {gender.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Especificacoes tecnicas
                </h3>
                <p className="text-sm text-slate-500">
                  Adicione pares de chave e valor para caracteristicas extras.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ key: "", value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar campo
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <div className="space-y-2">
                    <Label>Chave</Label>
                    <Input
                      {...register(`specifications_rows.${index}.key`)}
                      placeholder="Ex.: capacidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      {...register(`specifications_rows.${index}.value`)}
                      placeholder="Ex.: 17 tiros"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (fields.length === 1) {
                          setValue(
                            "specifications_rows",
                            [{ key: "", value: "" }],
                            { shouldDirty: true },
                          );
                          return;
                        }

                        remove(index);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild type="button" variant="outline">
              <Link
                href={
                  mode === "create"
                    ? "/armaments"
                    : `/armaments/${armament?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar armamento"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
