"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateArmamentLoanMutation,
  useUpdateArmamentLoanMutation,
} from "@/hooks/use-armament-loan-mutations";
import {
  formatArmamentOptionLabel,
  formatPoliceOfficerOptionLabel,
} from "@/lib/option-labels";
import { armamentsService } from "@/services/armaments/service";
import { policeOfficersService } from "@/services/police-officers/service";
import { usersService } from "@/services/users/service";
import type {
  ArmamentLoanRecord,
  ArmamentLoanKind,
  CreateArmamentLoanDTO,
  UpdateArmamentLoanDTO,
} from "@/types/armament-loan.type";
import { armamentLoanKindOptions } from "@/types/armament-loan.type";
import type { ArmamentItem } from "@/types/armament.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
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

function buildArmamentLoanSchema(mode: "create" | "edit") {
  return z
    .object({
      police_officer_id: z.string(),
      kind: z.enum(["temporary", "cautela"]),
      loaned_at: z.string(),
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
          armament_id: z.string(),
          item_mode: z.enum(itemModeValues),
          armament_unit_id: z.string(),
          armament_batch_id: z.string(),
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

        if (!values.loaned_at) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["loaned_at"],
            message: "Informe a data e hora do emprestimo.",
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

      if (
        values.expected_return_at &&
        values.loaned_at &&
        values.expected_return_at < values.loaned_at
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expected_return_at"],
          message:
            "A previsao de devolucao deve ser igual ou posterior ao emprestimo.",
        });
      }

      values.items.forEach((item, index) => {
        if (mode !== "create") {
          return;
        }

        if (!item.armament_id || item.armament_id === "none") {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", index, "armament_id"],
            message: "Selecione o armamento.",
          });
        }

        if (item.item_mode === "unit") {
          if (!item.armament_unit_id.trim()) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["items", index, "armament_unit_id"],
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

        if (item.item_mode === "batch" && !item.armament_batch_id.trim()) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items", index, "armament_batch_id"],
            message: "Informe o ID do lote.",
          });
        }
      });
    });
}

type CreateFormValues = z.output<ReturnType<typeof buildArmamentLoanSchema>>;

interface ArmamentLoanFormProps {
  mode: "create" | "edit";
  loan?: ArmamentLoanRecord;
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

function getArmamentLabel(armament: ArmamentItem) {
  return formatArmamentOptionLabel(armament);
}

export function ArmamentLoanForm({ mode, loan }: ArmamentLoanFormProps) {
  const router = useRouter();
  const createMutation = useCreateArmamentLoanMutation();
  const updateMutation = useUpdateArmamentLoanMutation();
  const schema = buildArmamentLoanSchema(mode);

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
    CreateFormValues
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      police_officer_id: loan?.police_officer_id
        ? String(loan.police_officer_id)
        : "none",
      kind: loan?.kind ?? "temporary",
      loaned_at: formatDateTimeLocal(loan?.loaned_at),
      expected_return_at: formatDateTimeLocal(loan?.expected_return_at),
      approved_by: loan?.approved_by ? String(loan.approved_by) : "none",
      purpose: loan?.purpose ?? "",
      return_notes: loan?.return_notes ?? "",
      items:
        loan?.items?.map((item) => ({
          armament_id: String(item.armament_id),
          item_mode: item.armament_unit_id ? "unit" : "batch",
          armament_unit_id: item.armament_unit_id
            ? String(item.armament_unit_id)
            : "",
          armament_batch_id: item.armament_batch_id
            ? String(item.armament_batch_id)
            : "",
          quantity: item.quantity,
        })) ?? [
          {
            armament_id: "none",
            item_mode: "unit",
            armament_unit_id: "",
            armament_batch_id: "",
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
      loaned_at: formatDateTimeLocal(loan.loaned_at),
      expected_return_at: formatDateTimeLocal(loan.expected_return_at),
      approved_by: loan.approved_by ? String(loan.approved_by) : "none",
      purpose: loan.purpose ?? "",
      return_notes: loan.return_notes ?? "",
      items:
        loan.items?.map((item) => ({
          armament_id: String(item.armament_id),
          item_mode: item.armament_unit_id ? "unit" : "batch",
          armament_unit_id: item.armament_unit_id
            ? String(item.armament_unit_id)
            : "",
          armament_batch_id: item.armament_batch_id
            ? String(item.armament_batch_id)
            : "",
          quantity: item.quantity,
        })) ?? [],
    });
  }, [loan, reset]);

  async function onSubmit(values: CreateFormValues) {
    if (mode === "create") {
      const payload: CreateArmamentLoanDTO = {
        police_officer_id: Number(values.police_officer_id),
        kind: values.kind as ArmamentLoanKind,
        loaned_at: new Date(values.loaned_at).toISOString(),
        expected_return_at: values.expected_return_at
          ? new Date(values.expected_return_at).toISOString()
          : null,
        purpose: values.purpose.trim() || null,
        approved_by:
          values.approved_by !== "none" ? Number(values.approved_by) : null,
        items: values.items.map((item) => ({
          armament_id: Number(item.armament_id),
          armament_unit_id:
            item.item_mode === "unit" && item.armament_unit_id.trim()
              ? Number(item.armament_unit_id)
              : null,
          armament_batch_id:
            item.item_mode === "batch" && item.armament_batch_id.trim()
              ? Number(item.armament_batch_id)
              : null,
          quantity: item.item_mode === "unit" ? 1 : item.quantity,
        })),
      };

      const response = await createMutation.mutateAsync(payload);
      router.push(`/armament-loans/${response.data.id}`);
      return;
    }

    if (!loan) {
      return;
    }

    const payload: UpdateArmamentLoanDTO = {
      kind: values.kind as ArmamentLoanKind,
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
    router.push(`/armament-loans/${response.data.id}`);
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
  const selectedApprovedByOption = loan?.approved_by && loan?.approved_by_user
    ? {
        value: String(loan.approved_by),
        label: [loan.approved_by_user.name, loan.approved_by_user.email].filter(Boolean).join(" • "),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo emprestimo de armamento"
            : "Editar emprestimo de armamento"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Cadastre o policial, o contexto do emprestimo e os itens emprestados."
            : "Atualize apenas os dados do cabecalho. Itens e devolucoes seguem fluxo proprio."}
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
                queryKey={["armament-loan", "police-officers"]}
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
              <Select
                value={selectedKind}
                onValueChange={(value) =>
                  setValue("kind", value as ArmamentLoanKind, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {armamentLoanKindOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Emprestado em</Label>
              <Input
                type="datetime-local"
                disabled={mode === "edit"}
                {...register("loaned_at")}
              />
              {errors.loaned_at ? (
                <p className="text-sm text-destructive">
                  {errors.loaned_at.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Previsao de devolucao</Label>
              <Input
                type="datetime-local"
                {...register("expected_return_at")}
              />
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
                queryKey={["armament-loan", "approvers"]}
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
                <p className="text-sm text-destructive">
                  {errors.purpose.message}
                </p>
              ) : null}
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
                      Informe uma unidade ou um lote por item. A API valida se a
                      unidade ja esta emprestada ou se o lote ainda tem saldo.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      append({
                        armament_id: "none",
                        item_mode: "unit",
                        armament_unit_id: "",
                        armament_batch_id: "",
                        quantity: 1,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar item
                  </Button>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Ainda nao existe endpoint no backend para listar unidades e
                  lotes disponiveis no formulario. Por isso, nesta primeira
                  versao o preenchimento usa o ID da unidade ou do lote, e a API
                  confirma disponibilidade, vencimento e subunidade.
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const item = watchedItems?.[index];
                    const armament = loan?.items?.find(
                      (entry) => String(entry.armament_id) === item?.armament_id,
                    )?.armament;

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
                              {armament
                                ? getArmamentLabel(armament) ||
                                  `Armamento #${armament.id}`
                                : "Selecione o armamento e o modo do item."}
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
                            <Label>Armamento</Label>
                            <AsyncSearchableSelect
                              value={item?.armament_id === "none" ? undefined : item?.armament_id}
                              onValueChange={(value) =>
                                setValue(`items.${index}.armament_id`, value, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                              queryKey={["armament-loan", "armaments", index]}
                              loadPage={({ page, search }) =>
                                armamentsService.index({
                                  page,
                                  per_page: 20,
                                  search: search || undefined,
                                })
                              }
                              mapOption={(entry) => ({
                                value: String(entry.id),
                                label: getArmamentLabel(entry) || `Armamento #${entry.id}`,
                              })}
                              selectedOption={
                                armament
                                  ? {
                                      value: String(armament.id),
                                      label: getArmamentLabel(armament) || `Armamento #${armament.id}`,
                                    }
                                  : null
                              }
                              placeholder="Selecione o armamento"
                              searchPlaceholder="Buscar armamento por tipo ou variante"
                              emptyMessage="Nenhum armamento encontrado."
                            />
                            {errors.items?.[index]?.armament_id ? (
                              <p className="text-sm text-destructive">
                                {errors.items[index]?.armament_id?.message}
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
                                  setValue(`items.${index}.armament_batch_id`, "");
                                  setValue(`items.${index}.quantity`, 1);
                                } else {
                                  setValue(`items.${index}.armament_unit_id`, "");
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
                                {...register(`items.${index}.armament_unit_id`)}
                              />
                              <p className="text-xs text-slate-500">
                                A API bloqueia unidade ja emprestada, vencida ou
                                vinculada a outro armamento.
                              </p>
                              {errors.items?.[index]?.armament_unit_id ? (
                                <p className="text-sm text-destructive">
                                  {errors.items[index]?.armament_unit_id?.message}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-2 md:col-span-2">
                              <Label>ID do lote</Label>
                              <Input
                                inputMode="numeric"
                                placeholder="Ex.: 34"
                                {...register(`items.${index}.armament_batch_id`)}
                              />
                              <p className="text-xs text-slate-500">
                                Para lotes, o backend verifica saldo disponivel
                                antes de confirmar o emprestimo.
                              </p>
                              {errors.items?.[index]?.armament_batch_id ? (
                                <p className="text-sm text-destructive">
                                  {errors.items[index]?.armament_batch_id?.message}
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
                      <th className="px-4 py-3 font-medium">Armamento</th>
                      <th className="px-4 py-3 font-medium">Referencia</th>
                      <th className="px-4 py-3 font-medium">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loan?.items ?? []).map((item) => (
                      <tr key={item.id} className="border-t border-slate-200/70">
                        <td className="px-4 py-4">
                          {[item.armament?.type?.name, item.armament?.variant?.name]
                            .filter(Boolean)
                            .join(" ") || `Armamento #${item.armament_id}`}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {item.armament_unit_id
                            ? `Unidade #${item.armament_unit_id}`
                            : `Lote #${item.armament_batch_id}`}
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
                    <Link href={`/armament-loans/${loan.id}/return`}>
                      Ir para devolucao parcial
                    </Link>
                  </Button>
                </div>
              ) : null}
            </section>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href={loan ? `/armament-loans/${loan.id}` : "/armament-loans"}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar emprestimo"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
