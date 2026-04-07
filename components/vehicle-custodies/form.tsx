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
  useCreateVehicleCustodyMutation,
  useUpdateVehicleCustodyMutation,
} from "@/hooks/use-vehicle-custody-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { useUsers } from "@/hooks/use-users";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  CreateVehicleCustodyDTO,
  UpdateVehicleCustodyDTO,
  VehicleCustodyHolderType,
  VehicleCustodyItem,
} from "@/types/vehicle-custody.type";
import { vehicleCustodyHolderTypeOptions } from "@/types/vehicle-custody.type";
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

const holderModeValues = ["internal", "external"] as const;

const vehicleCustodyFormSchema = z
  .object({
    vehicle_id: z.string(),
    borrower_mode: z.enum(holderModeValues),
    borrower_type: z.string(),
    borrower_id: z.string(),
    external_borrower_name: z
      .string()
      .max(
        255,
        "O nome do responsavel externo deve ter no maximo 255 caracteres.",
      ),
    external_borrower_document: z
      .string()
      .max(20, "O documento deve ter no maximo 20 caracteres."),
    external_borrower_phone: z.string().refine(
      (value) => value.trim() === "" || value.replace(/\D/g, "").length >= 10,
      "Informe um telefone com 10 ou 11 digitos.",
    ),
    city_id: z.string(),
    start_km: z.coerce
      .number()
      .int()
      .min(0, "A quilometragem inicial deve ser maior ou igual a 0."),
    start_notes: z
      .string()
      .max(1000, "As observacoes iniciais devem ter no maximo 1000 caracteres."),
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
          message: "Selecione o tipo do responsavel interno.",
        });
      }

      if (!values.borrower_id || values.borrower_id === "none") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["borrower_id"],
          message: "Selecione o responsavel interno.",
        });
      }
    }

    if (
      values.borrower_mode === "external" &&
      values.external_borrower_name.trim().length < 3
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["external_borrower_name"],
        message:
          "Informe o nome do responsavel externo com ao menos 3 caracteres.",
      });
    }
  });

type VehicleCustodyFormValues = z.output<typeof vehicleCustodyFormSchema>;

interface VehicleCustodyFormProps {
  mode: "create" | "edit";
  custody?: VehicleCustodyItem;
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function inferBorrowerMode(custody?: VehicleCustodyItem) {
  if (!custody) {
    return "internal";
  }

  return custody.borrower_id ? "internal" : "external";
}

export function VehicleCustodyForm({
  mode,
  custody,
}: VehicleCustodyFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateVehicleCustodyMutation();
  const updateMutation = useUpdateVehicleCustodyMutation();
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const citiesQuery = useCities({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof vehicleCustodyFormSchema>,
    unknown,
    VehicleCustodyFormValues
  >({
    resolver: zodResolver(vehicleCustodyFormSchema),
    defaultValues: {
      vehicle_id: custody?.vehicle_id ? String(custody.vehicle_id) : "none",
      borrower_mode: inferBorrowerMode(custody),
      borrower_type: custody?.borrower_type ?? "none",
      borrower_id: custody?.borrower_id ? String(custody.borrower_id) : "none",
      external_borrower_name: custody?.external_borrower_name ?? "",
      external_borrower_document: custody?.external_borrower_document ?? "",
      external_borrower_phone: custody?.external_borrower_phone ?? "",
      city_id: custody?.city_id ? String(custody.city_id) : "none",
      start_km: custody?.start_km ?? 0,
      start_notes: custody?.start_notes ?? "",
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
    if (!custody) {
      return;
    }

    reset({
      vehicle_id: String(custody.vehicle_id),
      borrower_mode: inferBorrowerMode(custody),
      borrower_type: custody.borrower_type ?? "none",
      borrower_id: custody.borrower_id ? String(custody.borrower_id) : "none",
      external_borrower_name: custody.external_borrower_name ?? "",
      external_borrower_document: custody.external_borrower_document ?? "",
      external_borrower_phone: custody.external_borrower_phone ?? "",
      city_id: custody.city_id ? String(custody.city_id) : "none",
      start_km: custody.start_km,
      start_notes: custody.start_notes ?? "",
    });
  }, [custody, reset]);

  async function onSubmit(values: VehicleCustodyFormValues) {
    const payloadBase = {
      vehicle_id: Number(values.vehicle_id),
      borrower_id:
        values.borrower_mode === "internal" && values.borrower_id !== "none"
          ? Number(values.borrower_id)
          : null,
      borrower_type:
        values.borrower_mode === "internal" &&
        values.borrower_type !== "none"
          ? (values.borrower_type as VehicleCustodyHolderType)
          : null,
      external_borrower_name:
        values.borrower_mode === "external"
          ? values.external_borrower_name.trim() || null
          : null,
      external_borrower_document:
        values.borrower_mode === "external" &&
        values.external_borrower_document.trim()
          ? sanitizeDigits(values.external_borrower_document)
          : null,
      external_borrower_phone:
        values.borrower_mode === "external" &&
        values.external_borrower_phone.trim()
          ? sanitizeDigits(values.external_borrower_phone)
          : null,
      city_id: values.city_id !== "none" ? Number(values.city_id) : null,
      subunit_id: activeSubunit ? Number(activeSubunit.id) : null,
      start_km: values.start_km,
      start_notes: values.start_notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateVehicleCustodyDTO,
      );
      router.push(`/vehicle-custodies/${response.data.id}`);
      return;
    }

    if (!custody) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: custody.id,
      payload: payloadBase satisfies UpdateVehicleCustodyDTO,
    });
    router.push(`/vehicle-custodies/${response.data.id}`);
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
          {mode === "create" ? "Nova cautela" : "Editar cautela"}
        </CardTitle>
        <CardDescription>
          Esta tela gerencial registra a entrega do veiculo em cautela. A
          subunidade, data, hora e status inicial sao assumidos automaticamente
          pelo sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
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
              <Label>Subunidade atual</Label>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">
                  {activeSubunit
                    ? `${activeSubunit.name}${activeSubunit.abbreviation ? ` (${activeSubunit.abbreviation})` : ""}`
                    : "Nenhuma subunidade ativa selecionada"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  A cautela sera registrada automaticamente nesta subunidade.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Responsavel
              </h2>
              <p className="text-sm text-slate-500">
                Escolha se o responsavel esta cadastrado no sistema ou se a
                cautela foi entregue para uma pessoa externa.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Modo do responsavel</Label>
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
                    <SelectValue placeholder="Selecione o modo do responsavel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Responsavel interno</SelectItem>
                    <SelectItem value="external">Responsavel externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {borrowerMode === "internal" ? (
                <div className="space-y-2">
                  <Label>Tipo de responsavel</Label>
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
                      {vehicleCustodyHolderTypeOptions.map((option) => (
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
                <Label>Responsavel interno</Label>
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
                    <SelectValue placeholder="Selecione o responsavel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione o responsavel</SelectItem>
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
              <Label>Inicio automatico</Label>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">
                  A data e hora do inicio da cautela serao registradas
                  automaticamente no momento da criacao.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_notes">Observacoes iniciais</Label>
              <Textarea
                id="start_notes"
                placeholder="Anote o estado do veiculo no momento da entrega."
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
                disabled
                placeholder="Preenchidas depois, no momento da devolucao."
                value=""
                readOnly
              />
              <p className="text-xs text-slate-500">
                Esta etapa sera preenchida apenas ao finalizar a cautela.
              </p>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create"
                    ? "/vehicle-custodies"
                    : `/vehicle-custodies/${custody?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar cautela"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
