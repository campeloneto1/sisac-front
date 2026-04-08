"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import {
  useCreateMaterialLoanMutation,
  useUpdateMaterialLoanMutation,
} from "@/hooks/use-material-loan-mutations";
import {
  formatMaterialOptionLabel,
  formatPoliceOfficerOptionLabel,
} from "@/lib/option-labels";
import { materialsService } from "@/services/materials/service";
import { policeOfficersService } from "@/services/police-officers/service";
import { usersService } from "@/services/users/service";
import type {
  CreateMaterialLoanDTO,
  MaterialLoanKind,
  MaterialLoanRecord,
  UpdateMaterialLoanDTO,
} from "@/types/material-loan.type";
import { materialLoanKindOptions } from "@/types/material-loan.type";
import type { MaterialItem } from "@/types/material.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const itemModeValues = ["unit", "batch"] as const;

function buildMaterialLoanSchema(mode: "create" | "edit") {
  return z
    .object({
      police_officer_id: z.string(),
      kind: z.enum(["temporary", "cautela"]),
      expected_return_at: z.string(),
      approved_by: z.string(),
      purpose: z
        .string()
        .max(1000, "A finalidade deve ter no maximo 1000 caracteres."),
      return_notes: z
        .string()
        .max(1000, "As observacoes devem ter no maximo 1000 caracteres."),
      items: z.array(
        z.object({
          material_id: z.string(),
          item_mode: z.enum(itemModeValues),
          material_unit_id: z.string(),
          material_batch_id: z.string(),
          quantity: z.coerce
            .number()
            .int()
            .min(1, "A quantidade deve ser maior ou igual a 1."),
        }),
      ),
    })
    .superRefine((values, context) => {
      if (mode === "create") {
        if (!values.police_officer_id || values.police_officer_id === "none") {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["police_officer_id"],
            message: "Selecione o policial.",
          });
        }

        if (values.items.length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items"],
            message: "Adicione ao menos um item ao emprestimo.",
          });
        }
      }

      values.items.forEach((item, index) => {
        if (mode !== "create") {
          return;
        }

        if (!item.material_id || item.material_id === "none") {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", index, "material_id"],
            message: "Selecione o material.",
          });
        }

        if (item.item_mode === "unit") {
          if (!item.material_unit_id.trim()) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["items", index, "material_unit_id"],
              message: "Informe o ID da unidade.",
            });
          }

          if (item.quantity !== 1) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["items", index, "quantity"],
              message: "Itens por unidade devem ter quantidade igual a 1.",
            });
          }
        }

        if (item.item_mode === "batch" && !item.material_batch_id.trim()) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", index, "material_batch_id"],
            message: "Informe o ID do lote.",
          });
        }
      });
    });
}

type MaterialLoanFormValues = z.output<ReturnType<typeof buildMaterialLoanSchema>>;

interface MaterialLoanFormProps {
  mode: "create" | "edit";
  loan?: MaterialLoanRecord;
}

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

function getMaterialLabel(material: MaterialItem) {
  return formatMaterialOptionLabel(material);
}

export function MaterialLoanForm({ mode, loan }: MaterialLoanFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateMaterialLoanMutation();
  const updateMutation = useUpdateMaterialLoanMutation();
  const schema = buildMaterialLoanSchema(mode);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof schema>,
    unknown,
    MaterialLoanFormValues
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      police_officer_id: loan?.police_officer_id
        ? String(loan.police_officer_id)
        : "none",
      kind: loan?.kind ?? "temporary",
      expected_return_at: formatDateTimeLocal(loan?.expected_return_at),
      approved_by: loan?.approved_by?.id ? String(loan.approved_by.id) : "none",
      purpose: loan?.purpose ?? "",
      return_notes: loan?.return_notes ?? "",
      items:
        loan?.items?.map((item) => ({
          material_id: String(item.material_id),
          item_mode: item.material_unit_id ? "unit" : "batch",
          material_unit_id: item.material_unit_id ? String(item.material_unit_id) : "",
          material_batch_id: item.material_batch_id ? String(item.material_batch_id) : "",
          quantity: item.quantity,
        })) ?? [
          {
            material_id: "none",
            item_mode: "unit",
            material_unit_id: "",
            material_batch_id: "",
            quantity: 1,
          },
        ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const watchedItems = useWatch({ control, name: "items" });

  useEffect(() => {
    if (!loan) {
      return;
    }

    reset({
      police_officer_id: String(loan.police_officer_id),
      kind: loan.kind,
      expected_return_at: formatDateTimeLocal(loan.expected_return_at),
      approved_by: loan.approved_by?.id ? String(loan.approved_by.id) : "none",
      purpose: loan.purpose ?? "",
      return_notes: loan.return_notes ?? "",
      items:
        loan.items?.map((item) => ({
          material_id: String(item.material_id),
          item_mode: item.material_unit_id ? "unit" : "batch",
          material_unit_id: item.material_unit_id ? String(item.material_unit_id) : "",
          material_batch_id: item.material_batch_id ? String(item.material_batch_id) : "",
          quantity: item.quantity,
        })) ?? [],
    });
  }, [loan, reset]);

  async function onSubmit(values: MaterialLoanFormValues) {
    if (!activeSubunit) {
      return;
    }

    if (mode === "create") {
      const payload: CreateMaterialLoanDTO = {
        police_officer_id: Number(values.police_officer_id),
        kind: values.kind as MaterialLoanKind,
        expected_return_at: values.expected_return_at
          ? new Date(values.expected_return_at).toISOString()
          : null,
        purpose: values.purpose.trim() || null,
        approved_by:
          values.approved_by !== "none" ? Number(values.approved_by) : null,
        items: values.items.map((item) => ({
          material_id: Number(item.material_id),
          material_unit_id:
            item.item_mode === "unit" && item.material_unit_id.trim()
              ? Number(item.material_unit_id)
              : null,
          material_batch_id:
            item.item_mode === "batch" && item.material_batch_id.trim()
              ? Number(item.material_batch_id)
              : null,
          quantity: item.item_mode === "unit" ? 1 : item.quantity,
        })),
      };

      const response = await createMutation.mutateAsync(payload);
      router.push(`/material-loans/${response.data.id}`);
      return;
    }

    if (!loan) {
      return;
    }

    const payload: UpdateMaterialLoanDTO = {
      expected_return_at: values.expected_return_at
        ? new Date(values.expected_return_at).toISOString()
        : null,
      purpose: values.purpose.trim() || null,
      return_notes: values.return_notes.trim() || null,
      approved_by:
        values.approved_by !== "none" ? Number(values.approved_by) : null,
    };

    const response = await updateMutation.mutateAsync({
      id: loan.id,
      payload,
    });
    router.push(`/material-loans/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedPoliceOfficerId = useWatch({ control, name: "police_officer_id" });
  const selectedKind = useWatch({ control, name: "kind" });
  const selectedApprovedBy = useWatch({ control, name: "approved_by" });
  const selectedPoliceOfficerOption = loan?.police_officer
    ? {
        value: String(loan.police_officer_id),
        label: formatPoliceOfficerOptionLabel({
          ...loan.police_officer,
          id: loan.police_officer_id,
        }),
      }
    : null;
  const selectedApprovedByOption = loan?.approved_by
    ? {
        value: String(loan.approved_by.id),
        label: [loan.approved_by.name, loan.approved_by.email]
          .filter(Boolean)
          .join(" • "),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo emprestimo de material"
            : "Editar emprestimo de material"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Cadastre o policial, o tipo do emprestimo e os itens vinculados por unidade ou lote."
            : "Atualize apenas o cabecalho. Itens e devolucoes seguem fluxo proprio."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Policial</Label>
              <AsyncSearchableSelect
                disabled={mode === "edit"}
                value={selectedPoliceOfficerId === "none" ? undefined : selectedPoliceOfficerId}
                onValueChange={(value) =>
                  setValue("police_officer_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                queryKey={["material-loan", "police-officers"]}
                loadPage={({ page, search }) =>
                  policeOfficersService.index({
                    page,
                    per_page: 20,
                    search: search || undefined,
                  })
                }
                mapOption={(officer) => ({
                  value: String(officer.id),
                  label: formatPoliceOfficerOptionLabel(officer),
                })}
                selectedOption={selectedPoliceOfficerOption}
                placeholder="Selecione o policial"
                searchPlaceholder="Buscar policial por nome ou matricula"
                emptyMessage="Nenhum policial encontrado."
              />
              {errors.police_officer_id ? (
                <p className="text-sm text-destructive">
                  {errors.police_officer_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              {mode === "create" ? (
                <Select
                  value={selectedKind}
                  onValueChange={(value) =>
                    setValue("kind", value as MaterialLoanKind, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialLoanKindOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={
                    materialLoanKindOptions.find((option) => option.value === loan?.kind)
                      ?.label ?? "Nao informado"
                  }
                  readOnly
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Previsao de devolucao</Label>
              <Input type="datetime-local" {...register("expected_return_at")} />
              {errors.expected_return_at ? (
                <p className="text-sm text-destructive">
                  {errors.expected_return_at.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Aprovado por</Label>
              <AsyncSearchableSelect
                value={selectedApprovedBy === "none" ? undefined : selectedApprovedBy}
                onValueChange={(value) =>
                  setValue("approved_by", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                queryKey={["material-loan", "approvers"]}
                loadPage={({ page, search }) =>
                  usersService.index({
                    page,
                    per_page: 20,
                    search: search || undefined,
                  })
                }
                mapOption={(user) => ({
                  value: String(user.id),
                  label: [user.name, user.email].filter(Boolean).join(" • "),
                })}
                selectedOption={selectedApprovedByOption}
                placeholder="Selecione o aprovador"
                searchPlaceholder="Buscar aprovador por nome ou email"
                emptyMessage="Nenhum aprovador encontrado."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Finalidade</Label>
              <Textarea
                rows={3}
                placeholder="Descreva a finalidade do emprestimo."
                {...register("purpose")}
              />
              {errors.purpose ? (
                <p className="text-sm text-destructive">{errors.purpose.message}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
              A subunidade vem do contexto ativo e o horario inicial do
              emprestimo agora e definido automaticamente pela API.
            </div>

            {mode === "edit" ? (
              <div className="space-y-2 md:col-span-2">
                <Label>Observacoes de retorno</Label>
                <Textarea
                  rows={3}
                  placeholder="Campo opcional para observacoes administrativas."
                  {...register("return_notes")}
                />
              </div>
            ) : null}
          </section>

          {mode === "create" ? (
            <>
              <Separator />

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Itens do emprestimo
                    </h2>
                    <p className="text-sm text-slate-500">
                      Informe uma unidade ou um lote por item. A API valida
                      disponibilidade, vencimento e coerencia com o material.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        material_id: "none",
                        item_mode: "unit",
                        material_unit_id: "",
                        material_batch_id: "",
                        quantity: 1,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar item
                  </Button>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Ainda nao existe endpoint dedicado para listar apenas unidades
                  e lotes disponiveis no formulario. Nesta primeira versao, o
                  preenchimento usa o ID da unidade ou do lote e a API confirma
                  saldo, vencimento e subunidade.
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const item = watchedItems?.[index];
                    const material = loan?.items?.find(
                      (entry) => String(entry.material_id) === item?.material_id,
                    )?.material;

                    return (
                      <Card
                        key={field.id}
                        className="border-slate-200/70 bg-slate-50/80"
                      >
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                          <div>
                            <CardTitle className="text-base">
                              Item {index + 1}
                            </CardTitle>
                            <CardDescription>
                              {material
                                ? getMaterialLabel(material) || `Material #${material.id}`
                                : "Selecione o material e o modo do item."}
                            </CardDescription>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={fields.length === 1}
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remover item</span>
                          </Button>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2 md:col-span-2">
                            <Label>Material</Label>
                            <AsyncSearchableSelect
                              value={item?.material_id === "none" ? undefined : item?.material_id}
                              onValueChange={(value) =>
                                setValue(`items.${index}.material_id`, value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                              queryKey={["material-loan", "materials", index]}
                              loadPage={({ page, search }) =>
                                materialsService.index({
                                  page,
                                  per_page: 20,
                                  search: search || undefined,
                                })
                              }
                              mapOption={(entry) => ({
                                value: String(entry.id),
                                label: getMaterialLabel(entry) || `Material #${entry.id}`,
                              })}
                              selectedOption={
                                material
                                  ? {
                                      value: String(material.id),
                                      label: getMaterialLabel(material) || `Material #${material.id}`,
                                    }
                                  : null
                              }
                              placeholder="Selecione o material"
                              searchPlaceholder="Buscar material por tipo ou variante"
                              emptyMessage="Nenhum material encontrado."
                            />
                            {errors.items?.[index]?.material_id ? (
                              <p className="text-sm text-destructive">
                                {errors.items[index]?.material_id?.message}
                              </p>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            <Label>Modo do item</Label>
                            <Select
                              value={item?.item_mode ?? "unit"}
                              onValueChange={(value) => {
                                setValue(
                                  `items.${index}.item_mode`,
                                  value as "unit" | "batch",
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  },
                                );
                                if (value === "unit") {
                                  setValue(`items.${index}.material_batch_id`, "");
                                  setValue(`items.${index}.quantity`, 1);
                                } else {
                                  setValue(`items.${index}.material_unit_id`, "");
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unit">Unidade</SelectItem>
                                <SelectItem value="batch">Lote</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              min={1}
                              readOnly={item?.item_mode === "unit"}
                              {...register(`items.${index}.quantity`)}
                            />
                            {errors.items?.[index]?.quantity ? (
                              <p className="text-sm text-destructive">
                                {errors.items[index]?.quantity?.message}
                              </p>
                            ) : null}
                          </div>

                          {item?.item_mode === "unit" ? (
                            <div className="space-y-2 md:col-span-2">
                              <Label>ID da unidade</Label>
                              <Input
                                inputMode="numeric"
                                placeholder="Ex.: 12"
                                {...register(`items.${index}.material_unit_id`)}
                              />
                              <p className="text-xs text-slate-500">
                                A API bloqueia unidade indisponivel, vencida ou
                                vinculada a outro material.
                              </p>
                              {errors.items?.[index]?.material_unit_id ? (
                                <p className="text-sm text-destructive">
                                  {errors.items[index]?.material_unit_id?.message}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-2 md:col-span-2">
                              <Label>ID do lote</Label>
                              <Input
                                inputMode="numeric"
                                placeholder="Ex.: 34"
                                {...register(`items.${index}.material_batch_id`)}
                              />
                              <p className="text-xs text-slate-500">
                                Para lotes, o backend verifica saldo disponivel
                                antes de confirmar o emprestimo.
                              </p>
                              {errors.items?.[index]?.material_batch_id ? (
                                <p className="text-sm text-destructive">
                                  {errors.items[index]?.material_batch_id?.message}
                                </p>
                              ) : null}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Itens emprestados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Os itens existentes nao sao alterados aqui. Para registrar
                devolucao total ou parcial, use o fluxo dedicado de retorno.
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Material</th>
                      <th className="px-4 py-3 font-medium">Referencia</th>
                      <th className="px-4 py-3 font-medium">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loan?.items ?? []).map((item) => (
                      <tr key={item.id} className="border-t border-slate-200/70">
                        <td className="px-4 py-4">
                          {item.material
                            ? getMaterialLabel(item.material) || `Material #${item.material_id}`
                            : `Material #${item.material_id}`}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {item.material_unit_id
                            ? `Unidade #${item.material_unit_id}`
                            : `Lote #${item.material_batch_id}`}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loan ? (
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href={`/material-loans/${loan.id}/return`}>
                      Ir para devolucao parcial
                    </Link>
                  </Button>
                </div>
              ) : null}
            </section>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href={loan ? `/material-loans/${loan.id}` : "/material-loans"}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending
                ? mode === "create"
                  ? "Salvando..."
                  : "Atualizando..."
                : mode === "create"
                  ? "Salvar emprestimo"
                  : "Atualizar emprestimo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
