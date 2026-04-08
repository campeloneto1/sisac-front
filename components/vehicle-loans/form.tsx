"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useCities } from "@/hooks/use-cities";
import {
  useCreateVehicleLoanMutation,
  useUpdateVehicleLoanMutation,
} from "@/hooks/use-vehicle-loan-mutations";
import {
  formatPoliceOfficerOptionLabel,
  formatVehicleOptionLabel,
} from "@/lib/option-labels";
import { policeOfficersService } from "@/services/police-officers/service";
import { usersService } from "@/services/users/service";
import { vehiclesService } from "@/services/vehicles/service";
import type {
  CreateVehicleLoanDTO,
  UpdateVehicleLoanDTO,
  VehicleLoanBorrowerType,
  VehicleLoanItem,
} from "@/types/vehicle-loan.type";
import { vehicleLoanBorrowerTypeOptions } from "@/types/vehicle-loan.type";
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
import { Textarea } from "@/components/ui/textarea";

const borrowerModeValues = ["internal", "external"] as const;

const vehicleLoanFormSchema = z
  .object({
    vehicle_id: z.string(),
    borrower_mode: z.enum(borrowerModeValues),
    borrower_type: z.string(),
    borrower_id: z.string(),
    external_borrower_name: z
      .string()
      .max(255, "O nome do tomador externo deve ter no máximo 255 caracteres."),
    external_borrower_document: z
      .string()
      .max(20, "O documento deve ter no máximo 20 caracteres."),
    external_borrower_phone: z
      .string()
      .refine(
        (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
        "Informe um telefone com 10 ou 11 dígitos.",
      ),
    city_id: z.string(),
    start_km: z.coerce.number().int().min(0, "A quilometragem inicial deve ser maior ou igual a 0."),
    start_notes: z
      .string()
      .max(1000, "As observações de retirada devem ter no máximo 1000 caracteres."),
  })
  .superRefine((values, context) => {
    if (!values.vehicle_id || values.vehicle_id === "none") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicle_id"],
        message: "Selecione um veículo.",
      });
    }

    if (values.borrower_mode === "internal") {
      if (!values.borrower_type || values.borrower_type === "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["borrower_type"],
          message: "Selecione o tipo do tomador interno.",
        });
      }

      if (!values.borrower_id || values.borrower_id === "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["borrower_id"],
          message: "Selecione o tomador interno.",
        });
      }
    }

    if (values.borrower_mode === "external" && values.external_borrower_name.trim().length < 3) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["external_borrower_name"],
        message: "Informe o nome do tomador externo com ao menos 3 caracteres.",
      });
    }
  });

type VehicleLoanFormValues = z.output<typeof vehicleLoanFormSchema>;

interface VehicleLoanFormProps {
  mode: "create" | "edit";
  loan?: VehicleLoanItem;
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function inferBorrowerMode(loan?: VehicleLoanItem) {
  if (!loan) {
    return "internal";
  }

  return loan.borrower_id ? "internal" : "external";
}

export function VehicleLoanForm({ mode, loan }: VehicleLoanFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateVehicleLoanMutation();
  const updateMutation = useUpdateVehicleLoanMutation();
  const citiesQuery = useCities({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof vehicleLoanFormSchema>,
    unknown,
    VehicleLoanFormValues
  >({
    resolver: zodResolver(vehicleLoanFormSchema),
    defaultValues: {
      vehicle_id: loan?.vehicle_id ? String(loan.vehicle_id) : "none",
      borrower_mode: inferBorrowerMode(loan),
      borrower_type: loan?.borrower_type ?? "none",
      borrower_id: loan?.borrower_id ? String(loan.borrower_id) : "none",
      external_borrower_name: loan?.external_borrower_name ?? "",
      external_borrower_document: loan?.external_borrower_document ?? "",
      external_borrower_phone: loan?.external_borrower_phone ?? "",
      city_id: loan?.city_id ? String(loan.city_id) : "none",
      start_km: loan?.start_km ?? 0,
      start_notes: loan?.start_notes ?? "",
    },
  });

  const borrowerMode = useWatch({
    control,
    name: "borrower_mode",
  });
  const borrowerType = useWatch({
    control,
    name: "borrower_type",
  });
  const selectedVehicleId = useWatch({
    control,
    name: "vehicle_id",
  });
  const selectedBorrowerId = useWatch({
    control,
    name: "borrower_id",
  });
  const selectedCityId = useWatch({
    control,
    name: "city_id",
  });

  useEffect(() => {
    if (!loan) {
      return;
    }

    reset({
      vehicle_id: String(loan.vehicle_id),
      borrower_mode: inferBorrowerMode(loan),
      borrower_type: loan.borrower_type ?? "none",
      borrower_id: loan.borrower_id ? String(loan.borrower_id) : "none",
      external_borrower_name: loan.external_borrower_name ?? "",
      external_borrower_document: loan.external_borrower_document ?? "",
      external_borrower_phone: loan.external_borrower_phone ?? "",
      city_id: loan.city_id ? String(loan.city_id) : "none",
      start_km: loan.start_km,
      start_notes: loan.start_notes ?? "",
    });
  }, [loan, reset]);

  async function onSubmit(values: VehicleLoanFormValues) {
    const payloadBase = {
      vehicle_id: Number(values.vehicle_id),
      borrower_id:
        values.borrower_mode === "internal" && values.borrower_id !== "none"
          ? Number(values.borrower_id)
          : null,
      borrower_type:
        values.borrower_mode === "internal" &&
        values.borrower_type !== "none"
          ? (values.borrower_type as VehicleLoanBorrowerType)
          : null,
      external_borrower_name:
        values.borrower_mode === "external"
          ? values.external_borrower_name.trim() || null
          : null,
      external_borrower_document:
        values.borrower_mode === "external" && values.external_borrower_document.trim()
          ? sanitizeDigits(values.external_borrower_document)
          : null,
      external_borrower_phone:
        values.borrower_mode === "external" && values.external_borrower_phone.trim()
          ? sanitizeDigits(values.external_borrower_phone)
          : null,
      city_id: values.city_id !== "none" ? Number(values.city_id) : null,
      start_km: values.start_km,
      start_notes: values.start_notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateVehicleLoanDTO,
      );
      router.push(`/vehicle-loans/${response.data.id}`);
      return;
    }

    if (!loan) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: loan.id,
      payload: payloadBase satisfies UpdateVehicleLoanDTO,
    });
    router.push(`/vehicle-loans/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedVehicleOption = loan?.vehicle
    ? {
        value: String(loan.vehicle_id),
        label: formatVehicleOptionLabel({ ...loan.vehicle, id: loan.vehicle_id }),
      }
    : null;
  const selectedBorrowerOption = loan?.borrower_id && loan?.borrower
    ? {
        value: String(loan.borrower_id),
        label:
          loan.borrower_type === "App\\Models\\PoliceOfficer"
            ? formatPoliceOfficerOptionLabel({ ...loan.borrower, id: loan.borrower_id })
            : [loan.borrower.name, loan.borrower.email].filter(Boolean).join(" • "),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo empréstimo" : "Editar empréstimo"}
        </CardTitle>
        <CardDescription>
          Esta tela gerencial registra a retirada do veículo. A subunidade,
          data, hora e status inicial sao assumidos automaticamente pelo
          sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
            <div className="space-y-2">
              <Label>Veículo</Label>
              <AsyncSearchableSelect
                value={selectedVehicleId === "none" ? undefined : selectedVehicleId}
                onValueChange={(value) =>
                  setValue("vehicle_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                queryKey={["vehicle-loan", "vehicles", mode]}
                loadPage={({ page, search }) =>
                  (mode === "create" ? vehiclesService.available : vehiclesService.index)({
                    page,
                    per_page: 20,
                    search: search || undefined,
                  })
                }
                mapOption={(vehicle) => ({
                  value: String(vehicle.id),
                  label: formatVehicleOptionLabel(vehicle),
                })}
                selectedOption={selectedVehicleOption}
                placeholder="Selecione um veículo"
                searchPlaceholder="Buscar por placa, marca ou variante"
                emptyMessage="Nenhum veículo encontrado."
              />
              {errors.vehicle_id ? (
                <p className="text-sm text-destructive">
                  {errors.vehicle_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Subunidade atual</Label>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">
                  {activeSubunit
                    ? `${activeSubunit.name}${activeSubunit.abbreviation ? ` (${activeSubunit.abbreviation})` : ""}`
                    : "Nenhuma subunidade ativa selecionada"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  O empréstimo será registrado automaticamente nesta
                  subunidade.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Tomador</h2>
              <p className="text-sm text-slate-500">
                Escolha se o tomador esta cadastrado no sistema ou se o
                empréstimo foi entregue para uma pessoa externa.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Modo do tomador</Label>
                <Select
                  value={borrowerMode}
                  onValueChange={(value) => {
                    setValue("borrower_mode", value as "internal" | "external", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    if (value === "internal") {
                      setValue("external_borrower_name", "");
                      setValue("external_borrower_document", "");
                      setValue("external_borrower_phone", "");
                    } else {
                      setValue("borrower_type", "none");
                      setValue("borrower_id", "none");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modo do tomador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Tomador interno</SelectItem>
                    <SelectItem value="external">Tomador externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {borrowerMode === "internal" ? (
                <div className="space-y-2">
                  <Label>Tipo de tomador</Label>
                  <Select
                    value={borrowerType}
                    onValueChange={(value) => {
                      setValue("borrower_type", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setValue("borrower_id", "none");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecione o tipo</SelectItem>
                      {vehicleLoanBorrowerTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.borrower_type ? (
                    <p className="text-sm text-destructive">
                      {errors.borrower_type.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {borrowerMode === "internal" ? (
              <div className="space-y-2">
                <Label>Tomador interno</Label>
                {borrowerType === "App\\Models\\PoliceOfficer" ? (
                  <AsyncSearchableSelect
                    value={selectedBorrowerId === "none" ? undefined : selectedBorrowerId}
                    onValueChange={(value) =>
                      setValue("borrower_id", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    queryKey={["vehicle-loan", "borrowers", "police-officers"]}
                    loadPage={({ page, search }) =>
                      policeOfficersService.index({
                        page,
                        per_page: 20,
                        search: search || undefined,
                      })
                    }
                    mapOption={(borrower) => ({
                      value: String(borrower.id),
                      label: formatPoliceOfficerOptionLabel(borrower),
                    })}
                    selectedOption={selectedBorrowerOption}
                    placeholder="Selecione o tomador"
                    searchPlaceholder="Buscar policial por nome ou matrícula"
                    emptyMessage="Nenhum policial encontrado."
                  />
                ) : borrowerType === "App\\Models\\User" ? (
                  <AsyncSearchableSelect
                    value={selectedBorrowerId === "none" ? undefined : selectedBorrowerId}
                    onValueChange={(value) =>
                      setValue("borrower_id", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    queryKey={["vehicle-loan", "borrowers", "users"]}
                    loadPage={({ page, search }) =>
                      usersService.index({
                        page,
                        per_page: 20,
                        search: search || undefined,
                      })
                    }
                    mapOption={(borrower) => ({
                      value: String(borrower.id),
                      label: [borrower.name, borrower.email].filter(Boolean).join(" • "),
                    })}
                    selectedOption={selectedBorrowerOption}
                    placeholder="Selecione o tomador"
                    searchPlaceholder="Buscar usuário por nome ou email"
                    emptyMessage="Nenhum usuário encontrado."
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    Selecione primeiro o tipo do tomador para habilitar a busca.
                  </div>
                )}
                {errors.borrower_id ? (
                  <p className="text-sm text-destructive">
                    {errors.borrower_id.message}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="external_borrower_name">Nome externo</Label>
                  <Input
                    id="external_borrower_name"
                    placeholder="Ex.: Joao de Souza"
                    {...register("external_borrower_name")}
                  />
                  {errors.external_borrower_name ? (
                    <p className="text-sm text-destructive">
                      {errors.external_borrower_name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external_borrower_document">Documento</Label>
                  <Input
                    id="external_borrower_document"
                    placeholder="CPF ou RG"
                    {...register("external_borrower_document")}
                  />
                  {errors.external_borrower_document ? (
                    <p className="text-sm text-destructive">
                      {errors.external_borrower_document.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external_borrower_phone">Telefone</Label>
                  <Input
                    id="external_borrower_phone"
                    placeholder="83999998888"
                    {...register("external_borrower_phone")}
                  />
                  {errors.external_borrower_phone ? (
                    <p className="text-sm text-destructive">
                      {errors.external_borrower_phone.message}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-5 md:grid-cols-[1fr_1fr_0.9fr]">
            <div className="space-y-2">
              <Label htmlFor="start_km">KM inicial</Label>
              <Input id="start_km" type="number" min={0} {...register("start_km")} />
              {errors.start_km ? (
                <p className="text-sm text-destructive">
                  {errors.start_km.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Select
                value={selectedCityId}
                onValueChange={(value) =>
                  setValue("city_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem cidade vinculada</SelectItem>
                  {(citiesQuery.data?.data ?? []).map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Saida automática</Label>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">
                  A data e hora da retirada serao registradas automaticamente
                  no momento da criação.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_notes">Observações de retirada</Label>
              <Textarea
                id="start_notes"
                placeholder="Anote o estado do veículo no momento da saida."
                {...register("start_notes")}
              />
              {errors.start_notes ? (
                <p className="text-sm text-destructive">
                  {errors.start_notes.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_notes">Observações de devolução</Label>
              <Textarea
                id="return_notes"
                disabled
                placeholder="Preenchidas depois, no momento da devolução."
                value=""
                readOnly
              />
              <p className="text-xs text-slate-500">
                Esta etapa será preenchida apenas ao devolver o veículo.
              </p>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/vehicle-loans" : `/vehicle-loans/${loan?.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar empréstimo" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
