"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useBrands } from "@/hooks/use-brands";
import { useCreateMaterialMutation, useUpdateMaterialMutation } from "@/hooks/use-material-mutations";
import { useMaterialTypes } from "@/hooks/use-material-types";
import { useVariants } from "@/hooks/use-variants";
import type { CreateMaterialDTO, MaterialItem, MaterialSpecifications, MaterialUnitStatus, UpdateMaterialDTO } from "@/types/material.type";
import { materialUnitStatusOptions } from "@/types/material.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const specificationRowSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const unitRowSchema = z.object({
  patrimony_number_1: z.string().max(100, "O patrimônio 1 deve ter no máximo 100 caracteres.").optional().or(z.literal("")),
  patrimony_number_2: z.string().max(100, "O patrimônio 2 deve ter no máximo 100 caracteres.").optional().or(z.literal("")),
  acquisition_date: z.string().optional().or(z.literal("")),
  expiration_date: z.string().optional().or(z.literal("")),
  status: z.enum(materialUnitStatusOptions.map((option) => option.value) as [MaterialUnitStatus, ...MaterialUnitStatus[]]),
});

const batchRowSchema = z.object({
  batch_number: z.string().min(1, "Informe o número do lote.").max(100, "O número do lote deve ter no máximo 100 caracteres."),
  quantity: z.number().int().min(1, "A quantidade deve ser maior que zero."),
  expiration_date: z.string().optional().or(z.literal("")),
});

const materialFormSchema = z.object({
  material_type_id: z.string().min(1, "Selecione o tipo de material."),
  brand_id: z.string().min(1, "Selecione a marca."),
  variant_id: z.string().min(1, "Selecione a variante."),
  specifications_rows: z.array(specificationRowSchema),
  units: z.array(unitRowSchema),
  batches: z.array(batchRowSchema),
});

type MaterialFormValues = z.input<typeof materialFormSchema>;
type MaterialFormOutput = z.output<typeof materialFormSchema>;

interface MaterialFormProps {
  mode: "create" | "edit";
  material?: MaterialItem;
}

function specificationRowsFromRecord(specifications?: MaterialSpecifications | null) {
  const entries = Object.entries(specifications ?? {});

  if (!entries.length) {
    return [{ key: "", value: "" }];
  }

  return entries.map(([key, value]) => ({ key, value }));
}

function specificationRecordFromRows(rows: { key: string; value: string }[]) {
  const record: MaterialSpecifications = {};

  rows.forEach((row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (key && value) {
      record[key] = value;
    }
  });

  return Object.keys(record).length ? record : null;
}

export function MaterialForm({ mode, material }: MaterialFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateMaterialMutation();
  const updateMutation = useUpdateMaterialMutation();
  const materialTypesQuery = useMaterialTypes({ per_page: 100 });
  const brandsQuery = useBrands({ per_page: 100, type: "logistics" });

  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MaterialFormValues, undefined, MaterialFormOutput>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      material_type_id: material?.material_type_id ? String(material.material_type_id) : "",
      brand_id: material?.variant?.brand_id ? String(material.variant.brand_id) : "",
      variant_id: material?.variant_id ? String(material.variant_id) : "",
      specifications_rows: specificationRowsFromRecord(material?.specifications),
      units: [],
      batches: [],
    },
  });

  const specificationsArray = useFieldArray({
    control,
    name: "specifications_rows",
  });

  const unitsArray = useFieldArray({
    control,
    name: "units",
  });

  const batchesArray = useFieldArray({
    control,
    name: "batches",
  });

  const selectedMaterialTypeId = useWatch({ control, name: "material_type_id" });
  const selectedBrandId = useWatch({ control, name: "brand_id" });
  const selectedVariantId = useWatch({ control, name: "variant_id" });
  const watchedUnits = useWatch({ control, name: "units" });
  const variantsQuery = useVariants(
    {
      per_page: 100,
      brand_id: selectedBrandId ? Number(selectedBrandId) : null,
    },
    Boolean(selectedBrandId),
  );

  const selectedMaterialType = materialTypesQuery.data?.data.find(
    (materialType) => String(materialType.id) === selectedMaterialTypeId,
  );
  const controlType = selectedMaterialType?.control_type;

  useEffect(() => {
    if (!material) {
      return;
    }

    reset({
      material_type_id: String(material.material_type_id),
      brand_id: material.variant?.brand_id ? String(material.variant.brand_id) : "",
      variant_id: String(material.variant_id),
      specifications_rows: specificationRowsFromRecord(material.specifications),
      units: [],
      batches: [],
    });
  }, [material, reset]);

  async function onSubmit(values: MaterialFormOutput) {
    if (!activeSubunit) {
      return;
    }

    const payloadBase = {
      material_type_id: Number(values.material_type_id),
      variant_id: Number(values.variant_id),
      specifications: specificationRecordFromRows(values.specifications_rows),
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync({
        ...payloadBase,
        units: values.units
          .map((unit) => ({
            patrimony_number_1: unit.patrimony_number_1?.trim() || null,
            patrimony_number_2: unit.patrimony_number_2?.trim() || null,
            acquisition_date: unit.acquisition_date || null,
            expiration_date: unit.expiration_date || null,
            status: unit.status || null,
          }))
          .filter((unit) => unit.patrimony_number_1 || unit.patrimony_number_2 || unit.acquisition_date || unit.expiration_date || unit.status),
        batches: values.batches
          .map((batch) => ({
            batch_number: batch.batch_number.trim(),
            quantity: batch.quantity,
            expiration_date: batch.expiration_date || null,
          }))
          .filter((batch) => batch.batch_number),
      } satisfies CreateMaterialDTO);
      router.push(`/materials/${response.data.id}`);
      return;
    }

    if (!material) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: material.id,
      payload: payloadBase satisfies UpdateMaterialDTO,
    });
    router.push(`/materials/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo material" : "Editar material"}</CardTitle>
        <CardDescription>
          Cadastre o material base dentro da subunidade ativa e, no create, adicione unidades individuais e lotes iniciais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Subunidade ativa: <span className="font-medium text-slate-900">{activeSubunit?.abbreviation || activeSubunit?.name || "Não selecionada"}</span>
        </div>

        {!activeSubunit ? (
          <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Selecione uma subunidade ativa antes de cadastrar ou editar materiais.
          </div>
        ) : null}

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de material</Label>
              <Select
                value={selectedMaterialTypeId || "none"}
                onValueChange={(value) =>
                  setValue("material_type_id", value === "none" ? "" : value, {
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
                  {(materialTypesQuery.data?.data ?? []).map((materialType) => (
                    <SelectItem key={materialType.id} value={String(materialType.id)}>
                      {materialType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.material_type_id ? <p className="text-sm text-destructive">{errors.material_type_id.message}</p> : null}
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
              {errors.brand_id ? <p className="text-sm text-destructive">{errors.brand_id.message}</p> : null}
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
              {errors.variant_id ? <p className="text-sm text-destructive">{errors.variant_id.message}</p> : null}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Especificacoes</h3>
                <p className="text-sm text-slate-500">Preencha atributos livres em formato chave e valor.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => specificationsArray.append({ key: "", value: "" })}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar especificação
              </Button>
            </div>

            <div className="space-y-3">
              {specificationsArray.fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]">
                  <Input placeholder="Chave" {...register(`specifications_rows.${index}.key` as const)} />
                  <Input placeholder="Valor" {...register(`specifications_rows.${index}.value` as const)} />
                  <Button type="button" variant="outline" size="icon" onClick={() => specificationsArray.remove(index)} disabled={specificationsArray.fields.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {mode === "create" ? (
            <>
              {!controlType ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                  Selecione um tipo de material para adicionar unidades ou lotes iniciais.
                </div>
              ) : null}

              {controlType === "unit" ? (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Unidades iniciais</h3>
                      <p className="text-sm text-slate-500">Opcional. Registre unidades individualizadas junto com o material.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => unitsArray.append({ patrimony_number_1: "", patrimony_number_2: "", acquisition_date: "", expiration_date: "", status: "available" })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar unidade
                    </Button>
                  </div>

                  {unitsArray.fields.length ? (
                    <div className="space-y-3">
                      {unitsArray.fields.map((field, index) => (
                        <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.9fr_0.9fr_0.9fr_auto]">
                          <Input placeholder="Patrimônio 1" {...register(`units.${index}.patrimony_number_1` as const)} />
                          <Input placeholder="Patrimônio 2" {...register(`units.${index}.patrimony_number_2` as const)} />
                          <Input type="date" {...register(`units.${index}.acquisition_date` as const)} />
                          <Input type="date" {...register(`units.${index}.expiration_date` as const)} />
                          <Select
                            value={watchedUnits?.[index]?.status || "available"}
                            onValueChange={(value) => setValue(`units.${index}.status`, value as MaterialUnitStatus, { shouldDirty: true, shouldValidate: true })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {materialUnitStatusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="icon" onClick={() => unitsArray.remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                      Nenhuma unidade inicial adicionada.
                    </div>
                  )}
                </section>
              ) : null}

              {controlType === "batch" ? (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Lotes iniciais</h3>
                      <p className="text-sm text-slate-500">Opcional. Registre lotes quando o material for controlado por quantidade.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => batchesArray.append({ batch_number: "", quantity: 1, expiration_date: "" })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar lote
                    </Button>
                  </div>

                  {batchesArray.fields.length ? (
                    <div className="space-y-3">
                      {batchesArray.fields.map((field, index) => (
                        <div key={field.id} className="grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 md:grid-cols-[1.2fr_0.8fr_1fr_auto]">
                          <div className="space-y-2">
                            <Input placeholder="Número do lote" {...register(`batches.${index}.batch_number` as const)} />
                            {errors.batches?.[index]?.batch_number ? <p className="text-sm text-destructive">{errors.batches[index]?.batch_number?.message}</p> : null}
                          </div>
                          <div className="space-y-2">
                            <Input type="number" min={1} placeholder="Quantidade" {...register(`batches.${index}.quantity` as const)} />
                            {errors.batches?.[index]?.quantity ? <p className="text-sm text-destructive">{errors.batches[index]?.quantity?.message}</p> : null}
                          </div>
                          <Input type="date" {...register(`batches.${index}.expiration_date` as const)} />
                          <Button type="button" variant="outline" size="icon" onClick={() => batchesArray.remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
                      Nenhum lote inicial adicionado.
                    </div>
                  )}
                </section>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              A edição deste formulario atualiza apenas os dados-base do material. Unidades e lotes permanecem somente para consulta neste fluxo.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/materials" : `/materials/${material?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar material" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
