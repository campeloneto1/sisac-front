"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useBrands } from "@/hooks/use-brands";
import { useColors } from "@/hooks/use-colors";
import { useUsers } from "@/hooks/use-users";
import { useVariants } from "@/hooks/use-variants";
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
} from "@/hooks/use-vehicle-mutations";
import { useVehicleTypes } from "@/hooks/use-vehicle-types";
import type {
  CreateVehicleDTO,
  UpdateVehicleDTO,
  VehicleItem,
} from "@/types/vehicle.type";
import {
  vehicleOperationalStatusOptions,
  vehicleOwnershipTypeOptions,
} from "@/types/vehicle.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

const vehicleFormSchema = z
  .object({
    license_plate: z
      .string()
      .min(7, "A placa precisa ter ao menos 7 caracteres.")
      .max(10, "A placa deve ter no máximo 10 caracteres."),
    special_plate: z
      .string()
      .max(20, "A placa especial deve ter no máximo 20 caracteres.")
      .optional()
      .or(z.literal("")),
    chassis: z
      .string()
      .max(30, "O chassis deve ter no máximo 30 caracteres.")
      .optional()
      .or(z.literal("")),
    renavam: z
      .string()
      .max(20, "O RENAVAM deve ter no máximo 20 caracteres.")
      .optional()
      .or(z.literal("")),
    manufacture_year: z.string().optional().or(z.literal("")),
    model_year: z.string().optional().or(z.literal("")),
    initial_km: z.string().min(1, "Informe a quilometragem inicial."),
    current_km: z.string().min(1, "Informe a quilometragem atual."),
    oil_change_km: z.string().optional().or(z.literal("")),
    revision_km: z.string().optional().or(z.literal("")),
    revision_date: z.string().optional().or(z.literal("")),
    decommission_date: z.string().optional().or(z.literal("")),
    operational_status: z.string(),
    ownership_type: z.string(),
    color_id: z.string(),
    vehicle_type_id: z.string(),
    brand_id: z.string().min(1, "Selecione a marca."),
    variant_id: z.string(),
    assigned_to_user_id: z.string(),
    is_armored: z.boolean(),
    is_available_for_trip: z.boolean(),
    notes: z
      .string()
      .max(5000, "As observações devem ter no máximo 5000 caracteres.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => Number(data.current_km) >= Number(data.initial_km), {
    message:
      "A quilometragem atual deve ser maior ou igual a quilometragem inicial.",
    path: ["current_km"],
  });

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  mode: "create" | "edit";
  vehicle?: VehicleItem;
}

function formatDateForInput(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function sanitizeLicensePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function sanitizeRenavam(value: string) {
  return value.replace(/\D/g, "");
}

function sanitizeChassis(value: string) {
  return value.toUpperCase().trim();
}

function parseOptionalNumber(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  return Number(value);
}

export function VehicleForm({ mode, vehicle }: VehicleFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleMutation();
  const updateMutation = useUpdateVehicleMutation();
  const colorsQuery = useColors({ per_page: 100 });
  const vehicleTypesQuery = useVehicleTypes({ per_page: 100 });
  const brandsQuery = useBrands({ per_page: 100, type: "vehicle" });
  const usersQuery = useUsers({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      license_plate: vehicle?.license_plate ?? "",
      special_plate: vehicle?.special_plate ?? "",
      chassis: vehicle?.chassis ?? "",
      renavam: vehicle?.renavam ?? "",
      manufacture_year: vehicle?.manufacture_year
        ? String(vehicle.manufacture_year)
        : "",
      model_year: vehicle?.model_year ? String(vehicle.model_year) : "",
      initial_km: vehicle ? String(vehicle.initial_km) : "0",
      current_km: vehicle ? String(vehicle.current_km) : "0",
      oil_change_km: vehicle?.oil_change_km
        ? String(vehicle.oil_change_km)
        : "",
      revision_km: vehicle?.revision_km ? String(vehicle.revision_km) : "",
      revision_date: formatDateForInput(vehicle?.revision_date),
      decommission_date: formatDateForInput(vehicle?.decommission_date),
      operational_status: vehicle?.operational_status ?? "available",
      ownership_type: vehicle?.ownership_type ?? "owned",
      color_id: vehicle?.color_id ? String(vehicle.color_id) : "none",
      vehicle_type_id: vehicle?.vehicle_type_id
        ? String(vehicle.vehicle_type_id)
        : "none",
      brand_id: vehicle?.variant?.brand?.id
        ? String(vehicle.variant.brand.id)
        : "",
      variant_id: vehicle?.variant_id ? String(vehicle.variant_id) : "none",
      assigned_to_user_id: vehicle?.assigned_to_user_id
        ? String(vehicle.assigned_to_user_id)
        : "none",
      is_armored: vehicle?.is_armored ?? false,
      is_available_for_trip: vehicle?.is_available_for_trip ?? false,
      notes: vehicle?.notes ?? "",
    },
  });

  const selectedOperationalStatus = useWatch({
    control,
    name: "operational_status",
  });
  const selectedOwnershipType = useWatch({
    control,
    name: "ownership_type",
  });
  const selectedColorId = useWatch({
    control,
    name: "color_id",
  });
  const selectedVehicleTypeId = useWatch({
    control,
    name: "vehicle_type_id",
  });
  const selectedBrandId = useWatch({
    control,
    name: "brand_id",
  });
  const selectedVariantId = useWatch({
    control,
    name: "variant_id",
  });
  const selectedAssignedTo = useWatch({
    control,
    name: "assigned_to_user_id",
  });
  const isArmored = useWatch({
    control,
    name: "is_armored",
  });
  const isAvailableForTrip = useWatch({
    control,
    name: "is_available_for_trip",
  });
  const variantsQuery = useVariants(
    {
      per_page: 100,
      brand_id:
        selectedBrandId && selectedBrandId !== "none"
          ? Number(selectedBrandId)
          : null,
    },
    Boolean(selectedBrandId && selectedBrandId !== "none"),
  );

  useEffect(() => {
    if (!vehicle) {
      return;
    }

    reset({
      license_plate: vehicle.license_plate ?? "",
      special_plate: vehicle.special_plate ?? "",
      chassis: vehicle.chassis ?? "",
      renavam: vehicle.renavam ?? "",
      manufacture_year: vehicle.manufacture_year
        ? String(vehicle.manufacture_year)
        : "",
      model_year: vehicle.model_year ? String(vehicle.model_year) : "",
      initial_km: String(vehicle.initial_km),
      current_km: String(vehicle.current_km),
      oil_change_km: vehicle.oil_change_km ? String(vehicle.oil_change_km) : "",
      revision_km: vehicle.revision_km ? String(vehicle.revision_km) : "",
      revision_date: formatDateForInput(vehicle.revision_date),
      decommission_date: formatDateForInput(vehicle.decommission_date),
      operational_status: vehicle.operational_status ?? "available",
      ownership_type: vehicle.ownership_type ?? "owned",
      color_id: vehicle.color_id ? String(vehicle.color_id) : "none",
      vehicle_type_id: vehicle.vehicle_type_id
        ? String(vehicle.vehicle_type_id)
        : "none",
      brand_id: vehicle.variant?.brand?.id
        ? String(vehicle.variant.brand.id)
        : "",
      variant_id: vehicle.variant_id ? String(vehicle.variant_id) : "none",
      assigned_to_user_id: vehicle.assigned_to_user_id
        ? String(vehicle.assigned_to_user_id)
        : "none",
      is_armored: vehicle.is_armored ?? false,
      is_available_for_trip: vehicle.is_available_for_trip ?? false,
      notes: vehicle.notes ?? "",
    });
  }, [vehicle, reset]);

  async function onSubmit(values: VehicleFormValues) {
    const payloadBase = {
      license_plate: sanitizeLicensePlate(values.license_plate),
      special_plate: values.special_plate?.trim() || null,
      chassis: values.chassis?.trim() ? sanitizeChassis(values.chassis) : null,
      renavam: values.renavam?.trim() ? sanitizeRenavam(values.renavam) : null,
      manufacture_year: parseOptionalNumber(values.manufacture_year),
      model_year: parseOptionalNumber(values.model_year),
      is_armored: values.is_armored,
      is_available_for_trip: values.is_available_for_trip,
      operational_status:
        values.operational_status as CreateVehicleDTO["operational_status"],
      ownership_type:
        values.ownership_type as CreateVehicleDTO["ownership_type"],
      assigned_to_user_id:
        values.assigned_to_user_id !== "none"
          ? Number(values.assigned_to_user_id)
          : null,
      initial_km: Number(values.initial_km),
      current_km: Number(values.current_km),
      oil_change_km: parseOptionalNumber(values.oil_change_km),
      revision_km: parseOptionalNumber(values.revision_km),
      revision_date: values.revision_date || null,
      decommission_date: values.decommission_date || null,
      notes: values.notes?.trim() || null,
      color_id: values.color_id !== "none" ? Number(values.color_id) : null,
      vehicle_type_id:
        values.vehicle_type_id !== "none"
          ? Number(values.vehicle_type_id)
          : null,
      variant_id:
        values.variant_id !== "none" ? Number(values.variant_id) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateVehicleDTO,
      );
      router.push(`/vehicles/${response.data.id}`);
      return;
    }

    if (!vehicle) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: vehicle.id,
      payload: payloadBase satisfies UpdateVehicleDTO,
    });
    router.push(`/vehicles/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo veículo" : "Editar veículo"}
        </CardTitle>
        <CardDescription>
          Cadastro operacional do veículo com identificação, classificação,
          quilometragem e vínculos administrativos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Identificação
              </h3>
              <p className="text-sm text-slate-500">
                Dados unicos e identificadores principais do veículo.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="license_plate">Placa *</Label>
                <Input
                  id="license_plate"
                  placeholder="Ex.: ABC1234"
                  {...register("license_plate")}
                  maxLength={7}
                />
                {errors.license_plate ? (
                  <p className="text-sm text-destructive">
                    {errors.license_plate.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_plate">Placa especial</Label>
                <Input
                  id="special_plate"
                  placeholder="Opcional"
                  {...register("special_plate")}
                  maxLength={7}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chassis">Chassis</Label>
                <Input
                  id="chassis"
                  placeholder="Ex.: 9BWZZZ377VT004251"
                  {...register("chassis")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="renavam">RENAVAM</Label>
                <Input
                  id="renavam"
                  placeholder="Somente numeros"
                  {...register("renavam")}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Classificação
              </h3>
              <p className="text-sm text-slate-500">
                Tipo, modelo, cor e contexto operacional.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo de veículo</Label>
                <Select
                  value={selectedVehicleTypeId}
                  onValueChange={(value) =>
                    setValue("vehicle_type_id", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {(vehicleTypesQuery.data?.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Marca *</Label>
                <Select
                  value={selectedBrandId || "none"}
                  onValueChange={(value) => {
                    const nextBrandId = value === "none" ? "" : value;

                    setValue("brand_id", nextBrandId, { shouldValidate: true });
                    setValue("variant_id", "none", { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {(brandsQuery.data?.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.abbreviation
                          ? `${item.name} (${item.abbreviation})`
                          : item.name}
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
                <Label>Modelo</Label>
                <Select
                  value={selectedVariantId}
                  disabled={!selectedBrandId || selectedBrandId === "none"}
                  onValueChange={(value) =>
                    setValue("variant_id", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedBrandId && selectedBrandId !== "none"
                          ? "Selecione"
                          : "Selecione uma marca primeiro"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {(variantsQuery.data?.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <Select
                  value={selectedColorId}
                  onValueChange={(value) =>
                    setValue("color_id", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {(colorsQuery.data?.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status operacional *</Label>
                <Select
                  value={selectedOperationalStatus}
                  onValueChange={(value) =>
                    setValue("operational_status", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOperationalStatusOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de posse *</Label>
                <Select
                  value={selectedOwnershipType}
                  onValueChange={(value) =>
                    setValue("ownership_type", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOwnershipTypeOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Quilometragem e revisao
              </h3>
              <p className="text-sm text-slate-500">
                Controle básico de uso e marcos preventivos.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="initial_km">KM inicial *</Label>
                <Input
                  id="initial_km"
                  type="number"
                  min={0}
                  {...register("initial_km")}
                />
                {errors.initial_km ? (
                  <p className="text-sm text-destructive">
                    {errors.initial_km.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_km">KM atual *</Label>
                <Input
                  id="current_km"
                  type="number"
                  min={0}
                  {...register("current_km")}
                />
                {errors.current_km ? (
                  <p className="text-sm text-destructive">
                    {errors.current_km.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="oil_change_km">KM troca de oleo</Label>
                <Input
                  id="oil_change_km"
                  type="number"
                  min={0}
                  {...register("oil_change_km")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision_km">KM revisao</Label>
                <Input
                  id="revision_km"
                  type="number"
                  min={0}
                  {...register("revision_km")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision_date">Data da revisao</Label>
                <Input
                  id="revision_date"
                  type="date"
                  {...register("revision_date")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decommission_date">Data de baixa</Label>
                <Input
                  id="decommission_date"
                  type="date"
                  {...register("decommission_date")}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Características e vinculacao
              </h3>
              <p className="text-sm text-slate-500">
                Flags operacionais, responsável atual e observações.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="manufacture_year">Ano de fabricacao</Label>
                <Input
                  id="manufacture_year"
                  type="number"
                  min={1900}
                  {...register("manufacture_year")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_year">Ano do modelo</Label>
                <Input
                  id="model_year"
                  type="number"
                  min={1900}
                  {...register("model_year")}
                />
              </div>

              <div className="space-y-2">
                <Label>Responsável atual</Label>
                <Select
                  value={selectedAssignedTo}
                  onValueChange={(value) =>
                    setValue("assigned_to_user_id", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não atribuido</SelectItem>
                    {(usersQuery.data?.data ?? []).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <Checkbox
                  checked={isArmored}
                  onCheckedChange={(checked) =>
                    setValue("is_armored", checked === true, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-slate-900">
                    Blindado
                  </span>
                  <span className="block text-sm text-slate-500">
                    Marque se o veículo possuir blindagem.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <Checkbox
                  checked={isAvailableForTrip}
                  onCheckedChange={(checked) =>
                    setValue("is_available_for_trip", checked === true, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
                <span className="space-y-1">
                  <span className="block text-sm font-medium text-slate-900">
                    Disponível para viagem
                  </span>
                  <span className="block text-sm text-slate-500">
                    Use para destacar veículos aptos para deslocamentos.
                  </span>
                </span>
              </label>

              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={5}
                  placeholder="Registre observações operacionais, administrativas ou técnicas."
                  {...register("notes")}
                />
                {errors.notes ? (
                  <p className="text-sm text-destructive">
                    {errors.notes.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link
                href={
                  mode === "create" ? "/vehicles" : `/vehicles/${vehicle?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar veículo"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
