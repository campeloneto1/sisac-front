"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { armamentUnitsService } from "@/services/armament-units/service";
import { armamentBatchesService } from "@/services/armament-batches/service";
import { policeOfficersService } from "@/services/police-officers/service";
import { usersService } from "@/services/users/service";
import type {
  ArmamentLoanRecord,
  ArmamentLoanKind,
  ArmamentLoanConfirmationDTO,
  CreateArmamentLoanDTO,
  UpdateArmamentLoanDTO,
} from "@/types/armament-loan.type";
import { armamentLoanKindOptions } from "@/types/armament-loan.type";
import type { ArmamentItem, ArmamentResponse } from "@/types/armament.type";
import { ArmamentLoanConfirmationDialog } from "@/components/armament-loans/confirmation-dialog";
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
      expected_return_at: z.string(),
      approved_by: z.string(),
      purpose: z
        .string()
        .max(1000, "A finalidade deve ter no máximo 1000 caracteres."),
      return_notes: z
        .string()
        .max(1000, "As observações devem ter no máximo 1000 caracteres."),
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

        if (values.items.length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["items"],
            message: "Adicione ao menos um item ao empréstimo.",
          });
        }
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
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [pendingCreateValues, setPendingCreateValues] =
    useState<CreateFormValues | null>(null);
  const [confirmationOfficer, setConfirmationOfficer] = useState<{
    policeOfficerId: number;
    userId: number;
    label: string;
    email?: string | null;
  } | null>(null);
  const [selectedArmaments, setSelectedArmaments] = useState<
    Record<number, ArmamentItem>
  >({});

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof schema>, unknown, CreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      police_officer_id: loan?.police_officer_id
        ? String(loan.police_officer_id)
        : "none",
      kind: loan?.kind ?? "temporary",
      expected_return_at: formatDateTimeLocal(loan?.expected_return_at),
      approved_by: loan?.approved_by ? String(loan.approved_by) : "none",
      purpose: loan?.purpose ?? "",
      return_notes: loan?.return_notes ?? "",
      items: loan?.items?.map((item) => ({
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
      const policeOfficerId = Number(values.police_officer_id);
      const policeOfficerResponse =
        await policeOfficersService.show(policeOfficerId);
      const policeOfficer = policeOfficerResponse.data;

      setPendingCreateValues(values);
      setConfirmationOfficer({
        policeOfficerId,
        userId: policeOfficer.user_id,
        label: formatPoliceOfficerOptionLabel(policeOfficer),
        email: policeOfficer.user?.email ?? policeOfficer.email ?? null,
      });
      setIsConfirmationDialogOpen(true);
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
  const selectedPoliceOfficerId = useWatch({
    control,
    name: "police_officer_id",
  });
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
  const selectedApprovedByOption =
    loan?.approved_by && loan?.approved_by_user
      ? {
          value: String(loan.approved_by),
          label: [loan.approved_by_user.name, loan.approved_by_user.email]
            .filter(Boolean)
            .join(" • "),
        }
      : null;

  async function handleCreateConfirmation(
    confirmation: ArmamentLoanConfirmationDTO,
  ) {
    if (!pendingCreateValues) {
      return;
    }

    const payload: CreateArmamentLoanDTO = {
      police_officer_id: Number(pendingCreateValues.police_officer_id),
      kind: pendingCreateValues.kind as ArmamentLoanKind,
      expected_return_at: pendingCreateValues.expected_return_at
        ? new Date(pendingCreateValues.expected_return_at).toISOString()
        : null,
      purpose: pendingCreateValues.purpose.trim() || null,
      approved_by:
        pendingCreateValues.approved_by !== "none"
          ? Number(pendingCreateValues.approved_by)
          : null,
      items: pendingCreateValues.items.map((item) => ({
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
      confirmation,
    };

    const response = await createMutation.mutateAsync(payload);
    setIsConfirmationDialogOpen(false);
    setPendingCreateValues(null);
    setConfirmationOfficer(null);
    router.push(`/armament-loans/${response.data.id}`);
  }

  return (
    <>
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>
            {mode === "create"
              ? "Novo empréstimo de armamento"
              : "Editar empréstimo de armamento"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Cadastre o policial, o contexto do empréstimo e os itens emprestados."
              : "Atualize apenas os dados do cabecalho. Itens e devolucoes seguem fluxo próprio."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <section className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Policial</Label>
                <AsyncSearchableSelect
                  disabled={mode === "edit"}
                  value={
                    selectedPoliceOfficerId === "none"
                      ? undefined
                      : selectedPoliceOfficerId
                  }
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
                  searchPlaceholder="Buscar policial por nome ou matrícula"
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
                <Label>Previsao de devolução</Label>
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
                  value={
                    selectedApprovedBy === "none"
                      ? undefined
                      : selectedApprovedBy
                  }
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
                  placeholder="Descreva a finalidade do empréstimo."
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
                  <Label>Observações de retorno</Label>
                  <Textarea
                    rows={3}
                    placeholder="Campo opcional para observações administrativas."
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
                        Itens do empréstimo
                      </h2>
                      <p className="text-sm text-slate-500">
                        Informe uma unidade ou um lote por item. A API válida se
                        a unidade já esta emprestada ou se o lote ainda tem
                        saldo.
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

                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const item = watchedItems?.[index];
                      const armament = loan?.items?.find(
                        (entry) =>
                          String(entry.armament_id) === item?.armament_id,
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
                                value={
                                  item?.armament_id === "none"
                                    ? undefined
                                    : item?.armament_id
                                }
                                onValueChange={async (value) => {
                                  setValue(
                                    `items.${index}.armament_id`,
                                    value,
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    },
                                  );

                                  // Busca o armamento para obter o control_type e auto-selecionar o modo
                                  try {
                                    const response: ArmamentResponse =
                                      await armamentsService.show(
                                        Number(value),
                                      );
                                    const armamentData = response.data;
                                    setSelectedArmaments((prev) => ({
                                      ...prev,
                                      [index]: armamentData,
                                    }));

                                    // Auto-seleciona o item_mode baseado no control_type
                                    const controlType =
                                      armamentData.type?.control_type;
                                    if (controlType === "unit") {
                                      setValue(
                                        `items.${index}.item_mode`,
                                        "unit",
                                        { shouldDirty: true },
                                      );
                                      setValue(
                                        `items.${index}.armament_batch_id`,
                                        "",
                                      );
                                      setValue(`items.${index}.quantity`, 1);
                                    } else if (controlType === "batch") {
                                      setValue(
                                        `items.${index}.item_mode`,
                                        "batch",
                                        { shouldDirty: true },
                                      );
                                      setValue(
                                        `items.${index}.armament_unit_id`,
                                        "",
                                      );
                                    }
                                  } catch {
                                    // Ignora erros de busca
                                  }
                                }}
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
                                  label:
                                    getArmamentLabel(entry) ||
                                    `Armamento #${entry.id}`,
                                })}
                                selectedOption={
                                  armament
                                    ? {
                                        value: String(armament.id),
                                        label:
                                          getArmamentLabel(armament) ||
                                          `Armamento #${armament.id}`,
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
                              {(() => {
                                const selectedArmament =
                                  selectedArmaments[index];
                                const controlType =
                                  selectedArmament?.type?.control_type;

                                return (
                                  <>
                                    <Select
                                      value={item?.item_mode ?? "unit"}
                                      disabled
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="unit">
                                          Unidade
                                        </SelectItem>
                                        <SelectItem value="batch">
                                          Lote
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500">
                                      {controlType
                                        ? `Definido pelo tipo de armamento (${controlType === "unit" ? "Unidade" : "Lote"})`
                                        : "Selecione um armamento"}
                                    </p>
                                  </>
                                );
                              })()}
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
                                <Label>Unidade</Label>
                                <AsyncSearchableSelect
                                  value={item?.armament_unit_id || undefined}
                                  onValueChange={(value) =>
                                    setValue(
                                      `items.${index}.armament_unit_id`,
                                      value,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                  queryKey={[
                                    "armament-units",
                                    item?.armament_id,
                                    index,
                                  ]}
                                  loadPage={({ page, search }) => {
                                    if (
                                      !item?.armament_id ||
                                      item.armament_id === "none"
                                    ) {
                                      return Promise.resolve({
                                        data: [],
                                        meta: {
                                          last_page: 1,
                                          current_page: 1,
                                          total: 0,
                                          from: 0,
                                          to: 0,
                                          per_page: 20,
                                          path: "",
                                          links: [],
                                        },
                                        links: {},
                                      });
                                    }
                                    return armamentUnitsService.index(
                                      Number(item.armament_id),
                                      {
                                        page,
                                        per_page: 20,
                                        search: search || undefined,
                                        status: "available",
                                      },
                                    );
                                  }}
                                  mapOption={(unit) => ({
                                    value: String(unit.id),
                                    label: unit.serial_number
                                      ? `${unit.serial_number} (${unit.status?.label || ""})`
                                      : `Unidade #${unit.id}`,
                                  })}
                                  selectedOption={null}
                                  placeholder="Selecione a unidade"
                                  searchPlaceholder="Buscar por número de série"
                                  emptyMessage={
                                    !item?.armament_id ||
                                    item.armament_id === "none"
                                      ? "Selecione um armamento primeiro"
                                      : "Nenhuma unidade disponível"
                                  }
                                  disabled={
                                    !item?.armament_id ||
                                    item.armament_id === "none"
                                  }
                                />
                                {errors.items?.[index]?.armament_unit_id ? (
                                  <p className="text-sm text-destructive">
                                    {
                                      errors.items[index]?.armament_unit_id
                                        ?.message
                                    }
                                  </p>
                                ) : null}
                              </div>
                            ) : (
                              <div className="space-y-2 md:col-span-2">
                                <Label>Lote</Label>
                                <AsyncSearchableSelect
                                  value={item?.armament_batch_id || undefined}
                                  onValueChange={(value) =>
                                    setValue(
                                      `items.${index}.armament_batch_id`,
                                      value,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                  queryKey={[
                                    "armament-batches",
                                    item?.armament_id,
                                    index,
                                  ]}
                                  loadPage={({ page, search }) => {
                                    if (
                                      !item?.armament_id ||
                                      item.armament_id === "none"
                                    ) {
                                      return Promise.resolve({
                                        data: [],
                                        meta: {
                                          last_page: 1,
                                          current_page: 1,
                                          total: 0,
                                          from: 0,
                                          to: 0,
                                          per_page: 20,
                                          path: "",
                                          links: [],
                                        },
                                        links: {},
                                      });
                                    }
                                    return armamentBatchesService.index({
                                      page,
                                      per_page: 20,
                                      search: search || undefined,
                                      armament_id: Number(item.armament_id),
                                      only_available: true,
                                    });
                                  }}
                                  mapOption={(batch) => ({
                                    value: String(batch.id),
                                    label: `${batch.batch_number} - Disponível: ${batch.available_quantity}/${batch.quantity}`,
                                  })}
                                  selectedOption={null}
                                  placeholder="Selecione o lote"
                                  searchPlaceholder="Buscar por número do lote"
                                  emptyMessage={
                                    !item?.armament_id ||
                                    item.armament_id === "none"
                                      ? "Selecione um armamento primeiro"
                                      : "Nenhum lote disponível"
                                  }
                                  disabled={
                                    !item?.armament_id ||
                                    item.armament_id === "none"
                                  }
                                />
                                {errors.items?.[index]?.armament_batch_id ? (
                                  <p className="text-sm text-destructive">
                                    {
                                      errors.items[index]?.armament_batch_id
                                        ?.message
                                    }
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
                  Os itens existentes não sao alterados aqui. Para registrar
                  devolução total ou parcial, use o fluxo dedicado de retorno.
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Armamento</th>
                        <th className="px-4 py-3 font-medium">Referência</th>
                        <th className="px-4 py-3 font-medium">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(loan?.items ?? []).map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-200/70"
                        >
                          <td className="px-4 py-4">
                            {[
                              item.armament?.type?.name,
                              item.armament?.variant?.name,
                            ]
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
                        Ir para devolução parcial
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </section>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link
                  href={loan ? `/armament-loans/${loan.id}` : "/armament-loans"}
                >
                  Cancelar
                </Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "Salvando..."
                  : mode === "create"
                    ? "Criar empréstimo"
                    : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {mode === "create" && confirmationOfficer ? (
        <ArmamentLoanConfirmationDialog
          open={isConfirmationDialogOpen}
          onOpenChange={(open) => {
            setIsConfirmationDialogOpen(open);
            if (!open) {
              setPendingCreateValues(null);
              setConfirmationOfficer(null);
            }
          }}
          title="Confirmar retirada de armamento"
          description="O próprio policial vinculado ao empréstimo deve confirmar a operação com a senha dele."
          officerLabel={confirmationOfficer.label}
          confirmerName={confirmationOfficer.label}
          confirmerEmail={confirmationOfficer.email}
          confirmedByUserId={confirmationOfficer.userId}
          isPending={createMutation.isPending}
          onConfirm={handleCreateConfirmation}
        />
      ) : null}
    </>
  );
}
