"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCities } from "@/hooks/use-cities";
import {
  useCreateVehicleLoanMutation,
  useUpdateVehicleLoanMutation,
} from "@/hooks/use-vehicle-loan-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { useSubunits } from "@/hooks/use-subunits";
import { useUsers } from "@/hooks/use-users";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  CreateVehicleLoanDTO,
  UpdateVehicleLoanDTO,
  VehicleLoanBorrowerType,
  VehicleLoanItem,
  VehicleLoanStatus,
} from "@/types/vehicle-loan.type";
import {
  vehicleLoanBorrowerTypeOptions,
  vehicleLoanStatusOptions,
} from "@/types/vehicle-loan.type";
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
      .max(255, "O nome do tomador externo deve ter no maximo 255 caracteres."),
    external_borrower_document: z
      .string()
      .max(20, "O documento deve ter no maximo 20 caracteres."),
    external_borrower_phone: z
      .string()
      .refine(
        (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
        "Informe um telefone com 10 ou 11 digitos.",
      ),
    city_id: z.string(),
    subunit_id: z.string(),
    start_date: z.string().min(1, "Informe a data de saida."),
    start_time: z.string(),
    end_date: z.string(),
    end_time: z.string(),
    start_km: z.coerce.number().int().min(0, "A quilometragem inicial deve ser maior ou igual a 0."),
    end_km: z.string(),
    start_notes: z
      .string()
      .max(1000, "As observacoes de retirada devem ter no maximo 1000 caracteres."),
    return_notes: z
      .string()
      .max(1000, "As observacoes de devolucao devem ter no maximo 1000 caracteres."),
    status: z.enum(["in_use", "returned"]),
  })
  .superRefine((values, context) => {
    if (!values.vehicle_id || values.vehicle_id === "none") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicle_id"],
        message: "Selecione um veiculo.",
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

    if (values.end_date && values.start_date && values.end_date < values.start_date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "A data de devolucao deve ser igual ou posterior a data de saida.",
      });
    }

    const parsedEndKm =
      values.end_km.trim() === "" ? undefined : Number(values.end_km);

    if (
      parsedEndKm !== undefined &&
      parsedEndKm !== null &&
      parsedEndKm < values.start_km
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_km"],
        message: "A quilometragem final deve ser maior ou igual a inicial.",
      });
    }

    if (values.status === "returned") {
      if (!values.end_date) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: "Informe a data de devolucao para emprestimos devolvidos.",
        });
      }

      if (parsedEndKm === undefined || parsedEndKm === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_km"],
          message: "Informe a quilometragem final para emprestimos devolvidos.",
        });
      }
    }
  });

type VehicleLoanFormValues = z.infer<typeof vehicleLoanFormSchema>;

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
  const createMutation = useCreateVehicleLoanMutation();
  const updateMutation = useUpdateVehicleLoanMutation();
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const citiesQuery = useCities({ per_page: 100 });
  const subunitsQuery = useSubunits({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<VehicleLoanFormValues>({
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
      subunit_id: loan?.subunit_id ? String(loan.subunit_id) : "none",
      start_date: loan?.start_date ? loan.start_date.slice(0, 10) : "",
      start_time: loan?.start_time ?? "",
      end_date: loan?.end_date ? loan.end_date.slice(0, 10) : "",
      end_time: loan?.end_time ?? "",
      start_km: loan?.start_km ?? 0,
      end_km:
        loan?.end_km !== null && loan?.end_km !== undefined
          ? String(loan.end_km)
          : "",
      start_notes: loan?.start_notes ?? "",
      return_notes: loan?.return_notes ?? "",
      status: loan?.status ?? "in_use",
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
  const selectedStatus = useWatch({
    control,
    name: "status",
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
  const selectedSubunitId = useWatch({
    control,
    name: "subunit_id",
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
      subunit_id: loan.subunit_id ? String(loan.subunit_id) : "none",
      start_date: loan.start_date ? loan.start_date.slice(0, 10) : "",
      start_time: loan.start_time ?? "",
      end_date: loan.end_date ? loan.end_date.slice(0, 10) : "",
      end_time: loan.end_time ?? "",
      start_km: loan.start_km,
      end_km:
        loan.end_km !== null && loan.end_km !== undefined
          ? String(loan.end_km)
          : "",
      start_notes: loan.start_notes ?? "",
      return_notes: loan.return_notes ?? "",
      status: loan.status ?? "in_use",
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
      subunit_id:
        values.subunit_id !== "none" ? Number(values.subunit_id) : null,
      start_date: values.start_date,
      start_time: values.start_time || null,
      end_date: values.end_date || null,
      end_time: values.end_time || null,
      start_km: values.start_km,
      end_km: values.end_km.trim() === "" ? null : Number(values.end_km),
      start_notes: values.start_notes.trim() || null,
      return_notes: values.return_notes.trim() || null,
      status: values.status satisfies VehicleLoanStatus,
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
  const internalBorrowers =
    borrowerType === "App\\Models\\PoliceOfficer"
      ? (policeOfficersQuery.data?.data ?? []).map((officer) => ({
          value: String(officer.id),
          label: officer.war_name || officer.name || officer.registration_number,
          detail: officer.registration_number,
        }))
      : borrowerType === "App\\Models\\User"
        ? (usersQuery.data?.data ?? []).map((user) => ({
            value: String(user.id),
            label: user.name,
            detail: user.email,
          }))
        : [];

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo emprestimo" : "Editar emprestimo"}
        </CardTitle>
        <CardDescription>
          Emprestimos acompanham a saida e a devolucao do veiculo sem depender
          de prazo fixo de retorno.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Veiculo</Label>
              <Select
                value={selectedVehicleId}
                onValueChange={(value) =>
                  setValue("vehicle_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veiculo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione um veiculo</SelectItem>
                  {(vehiclesQuery.data?.data ?? []).map((vehicle) => (
                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                      {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle_id ? (
                <p className="text-sm text-destructive">
                  {errors.vehicle_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue("status", value as VehicleLoanStatus, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleLoanStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status ? (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-5 rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Tomador</h2>
              <p className="text-sm text-slate-500">
                Escolha se o tomador esta cadastrado no sistema ou se o
                emprestimo foi entregue para uma pessoa externa.
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
                <Select
                  value={selectedBorrowerId}
                  onValueChange={(value) =>
                    setValue("borrower_id", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tomador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione o tomador</SelectItem>
                    {internalBorrowers.map((borrower) => (
                      <SelectItem key={borrower.value} value={borrower.value}>
                        {borrower.detail
                          ? `${borrower.label} • ${borrower.detail}`
                          : borrower.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de saida</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
              {errors.start_date ? (
                <p className="text-sm text-destructive">
                  {errors.start_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Hora de saida</Label>
              <Input id="start_time" type="time" {...register("start_time")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de devolucao</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
              {errors.end_date ? (
                <p className="text-sm text-destructive">
                  {errors.end_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Hora de devolucao</Label>
              <Input id="end_time" type="time" {...register("end_time")} />
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
              <Label htmlFor="end_km">KM final</Label>
              <Input id="end_km" type="number" min={0} {...register("end_km")} />
              {errors.end_km ? (
                <p className="text-sm text-destructive">
                  {errors.end_km.message}
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
              <Label>Subunidade</Label>
              <Select
                value={selectedSubunitId}
                onValueChange={(value) =>
                  setValue("subunit_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma subunidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem subunidade vinculada</SelectItem>
                  {(subunitsQuery.data?.data ?? []).map((subunit) => (
                    <SelectItem key={subunit.id} value={String(subunit.id)}>
                      {subunit.abbreviation
                        ? `${subunit.abbreviation} • ${subunit.name}`
                        : subunit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_notes">Observacoes de retirada</Label>
              <Textarea
                id="start_notes"
                placeholder="Anote o estado do veiculo no momento da saida."
                {...register("start_notes")}
              />
              {errors.start_notes ? (
                <p className="text-sm text-destructive">
                  {errors.start_notes.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_notes">Observacoes de devolucao</Label>
              <Textarea
                id="return_notes"
                placeholder="Anote o estado do veiculo no momento da devolucao."
                {...register("return_notes")}
              />
              {errors.return_notes ? (
                <p className="text-sm text-destructive">
                  {errors.return_notes.message}
                </p>
              ) : null}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/vehicle-loans" : `/vehicle-loans/${loan?.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar emprestimo" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
