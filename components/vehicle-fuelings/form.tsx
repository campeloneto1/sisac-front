"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVehicleFuelingMutation,
  useUpdateVehicleFuelingMutation,
} from "@/hooks/use-vehicle-fueling-mutations";
import { useUsers } from "@/hooks/use-users";
import { useVehicleCustodies } from "@/hooks/use-vehicle-custodies";
import { useVehicleLoans } from "@/hooks/use-vehicle-loans";
import { useVehicleMaintenances } from "@/hooks/use-vehicle-maintenances";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  CreateVehicleFuelingDTO,
  UpdateVehicleFuelingDTO,
  VehicleFuelingContextType,
  VehicleFuelingItem,
} from "@/types/vehicle-fueling.type";
import {
  getVehicleFuelingContextType,
  vehicleFuelingContextOptions,
  vehicleFuelTypeOptions,
} from "@/types/vehicle-fueling.type";
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

const vehicleFuelingFormSchema = z
  .object({
    vehicle_id: z.string().min(1, "Selecione um veiculo."),
    context_type: z.string().min(1, "Selecione o contexto do abastecimento."),
    context_id: z.string().min(1, "Selecione o registro relacionado."),
    fueling_date: z.string().min(1, "Informe a data do abastecimento."),
    fueling_time: z.string(),
    km: z.coerce.number().int().min(0, "Informe uma quilometragem valida."),
    fuel_type: z.string().min(1, "Selecione o combustivel."),
    liters: z.coerce.number().min(0.01, "Informe a quantidade de litros."),
    price_per_liter: z.union([z.coerce.number().min(0), z.literal("")]),
    total_cost: z.union([z.coerce.number().min(0), z.literal("")]),
    gas_station: z
      .string()
      .max(100, "O posto deve ter no maximo 100 caracteres."),
    gas_station_city: z
      .string()
      .max(100, "A cidade do posto deve ter no maximo 100 caracteres."),
    fueled_by_user_id: z.string(),
    invoice_number: z
      .string()
      .max(50, "O numero do cupom deve ter no maximo 50 caracteres."),
    is_full_tank: z.boolean(),
    notes: z
      .string()
      .max(1000, "As observacoes devem ter no maximo 1000 caracteres."),
  })
  .superRefine((values, ctx) => {
    if (values.fueling_date && values.fueling_date > new Date().toISOString().slice(0, 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fueling_date"],
        message: "A data do abastecimento nao pode ser futura.",
      });
    }
  });

type VehicleFuelingFormValues = z.output<typeof vehicleFuelingFormSchema>;

interface VehicleFuelingFormProps {
  mode: "create" | "edit";
  fueling?: VehicleFuelingItem;
}

function parseNumberField(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : Number(value);
}

function normalizeTime(value: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

export function VehicleFuelingForm({
  mode,
  fueling,
}: VehicleFuelingFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleFuelingMutation();
  const updateMutation = useUpdateVehicleFuelingMutation();
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const activeLoansQuery = useVehicleLoans(
    mode === "create" ? { per_page: 100, status: "in_use" } : { per_page: 100 },
  );
  const activeCustodiesQuery = useVehicleCustodies(
    mode === "create" ? { per_page: 100, status: "active" } : { per_page: 100 },
  );
  const activeMaintenancesQuery = useVehicleMaintenances(
    mode === "create"
      ? { per_page: 100, status: "in_progress" }
      : { per_page: 100 },
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof vehicleFuelingFormSchema>,
    unknown,
    VehicleFuelingFormValues
  >({
    resolver: zodResolver(vehicleFuelingFormSchema),
    defaultValues: {
      vehicle_id: fueling?.vehicle_id ? String(fueling.vehicle_id) : "",
      context_type: getVehicleFuelingContextType(fueling) ?? "",
      context_id: String(
        fueling?.vehicle_loan_id ??
          fueling?.vehicle_custody_id ??
          fueling?.vehicle_maintenance_id ??
          "",
      ),
      fueling_date: fueling?.fueling_date ?? "",
      fueling_time: fueling?.fueling_time?.slice(0, 5) ?? "",
      km: fueling?.km ?? 0,
      fuel_type: fueling?.fuel_type ?? "",
      liters: fueling?.liters ?? 0,
      price_per_liter: fueling?.price_per_liter ?? "",
      total_cost: fueling?.total_cost ?? "",
      gas_station: fueling?.gas_station ?? "",
      gas_station_city: fueling?.gas_station_city ?? "",
      fueled_by_user_id: fueling?.fueled_by_user_id
        ? String(fueling.fueled_by_user_id)
        : "none",
      invoice_number: fueling?.invoice_number ?? "",
      is_full_tank: fueling?.is_full_tank ?? false,
      notes: fueling?.notes ?? "",
    },
  });

  const selectedVehicleId = useWatch({ control, name: "vehicle_id" });
  const selectedContextType = useWatch({ control, name: "context_type" });
  const selectedContextId = useWatch({ control, name: "context_id" });
  const selectedFuelType = useWatch({ control, name: "fuel_type" });
  const selectedFueledByUserId = useWatch({
    control,
    name: "fueled_by_user_id",
  });
  const watchedLiters = useWatch({ control, name: "liters" });
  const watchedPricePerLiter = useWatch({ control, name: "price_per_liter" });
  const isFullTank = useWatch({ control, name: "is_full_tank" });

  useEffect(() => {
    if (!fueling) {
      return;
    }

    reset({
      vehicle_id: String(fueling.vehicle_id),
      context_type: getVehicleFuelingContextType(fueling) ?? "",
      context_id: String(
        fueling.vehicle_loan_id ??
          fueling.vehicle_custody_id ??
          fueling.vehicle_maintenance_id ??
          "",
      ),
      fueling_date: fueling.fueling_date ?? "",
      fueling_time: fueling.fueling_time?.slice(0, 5) ?? "",
      km: fueling.km ?? 0,
      fuel_type: fueling.fuel_type ?? "",
      liters: fueling.liters ?? 0,
      price_per_liter: fueling.price_per_liter ?? "",
      total_cost: fueling.total_cost ?? "",
      gas_station: fueling.gas_station ?? "",
      gas_station_city: fueling.gas_station_city ?? "",
      fueled_by_user_id: fueling.fueled_by_user_id
        ? String(fueling.fueled_by_user_id)
        : "none",
      invoice_number: fueling.invoice_number ?? "",
      is_full_tank: fueling.is_full_tank ?? false,
      notes: fueling.notes ?? "",
    });
  }, [fueling, reset]);

  useEffect(() => {
    const liters = Number(watchedLiters);
    const pricePerLiter = Number(watchedPricePerLiter);

    if (!Number.isFinite(liters) || liters <= 0) {
      return;
    }

    if (!Number.isFinite(pricePerLiter) || pricePerLiter < 0) {
      return;
    }

    setValue(
      "total_cost",
      Number((liters * pricePerLiter).toFixed(2)),
      { shouldDirty: true },
    );
  }, [setValue, watchedLiters, watchedPricePerLiter]);

  const contextOptions = useMemo(() => {
    if (selectedContextType === "vehicle_loan") {
      return (activeLoansQuery.data?.data ?? [])
        .filter((loan) =>
          selectedVehicleId ? String(loan.vehicle_id) === selectedVehicleId : true,
        )
        .map((loan) => ({
          value: String(loan.id),
          label: `${loan.vehicle?.license_plate ?? `#${loan.vehicle_id}`} • ${loan.status_label ?? "Emprestimo"}`,
        }));
    }

    if (selectedContextType === "vehicle_custody") {
      return (activeCustodiesQuery.data?.data ?? [])
        .filter((custody) =>
          selectedVehicleId
            ? String(custody.vehicle_id) === selectedVehicleId
            : true,
        )
        .map((custody) => ({
          value: String(custody.id),
          label: `${custody.vehicle?.license_plate ?? `#${custody.vehicle_id}`} • ${custody.status_label ?? "Cautela"}`,
        }));
    }

    if (selectedContextType === "vehicle_maintenance") {
      return (activeMaintenancesQuery.data?.data ?? [])
        .filter((maintenance) =>
          selectedVehicleId
            ? String(maintenance.vehicle_id) === selectedVehicleId
            : true,
        )
        .map((maintenance) => ({
          value: String(maintenance.id),
          label: `${maintenance.vehicle?.license_plate ?? `#${maintenance.vehicle_id}`} • ${maintenance.maintenance_type_label ?? "Manutencao"}`,
        }));
    }

    return [];
  }, [
    activeCustodiesQuery.data?.data,
    activeLoansQuery.data?.data,
    activeMaintenancesQuery.data?.data,
    selectedContextType,
    selectedVehicleId,
  ]);

  async function onSubmit(values: VehicleFuelingFormValues) {
    const contextType = values.context_type as VehicleFuelingContextType;
    const contextId = Number(values.context_id);

    const payloadBase = {
      vehicle_id: Number(values.vehicle_id),
      vehicle_loan_id: contextType === "vehicle_loan" ? contextId : null,
      vehicle_custody_id: contextType === "vehicle_custody" ? contextId : null,
      vehicle_maintenance_id:
        contextType === "vehicle_maintenance" ? contextId : null,
      fueling_date: values.fueling_date,
      fueling_time: normalizeTime(values.fueling_time),
      km: Number(values.km),
      fuel_type: values.fuel_type as CreateVehicleFuelingDTO["fuel_type"],
      liters: Number(values.liters),
      price_per_liter: parseNumberField(values.price_per_liter),
      total_cost: parseNumberField(values.total_cost),
      gas_station: values.gas_station.trim() || null,
      gas_station_city: values.gas_station_city.trim() || null,
      fueled_by_user_id:
        values.fueled_by_user_id && values.fueled_by_user_id !== "none"
          ? Number(values.fueled_by_user_id)
          : null,
      invoice_number: values.invoice_number.trim() || null,
      is_full_tank: values.is_full_tank,
      notes: values.notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreateVehicleFuelingDTO,
      );
      router.push(`/vehicle-fuelings/${response.data.id}`);
      return;
    }

    if (!fueling) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: fueling.id,
      payload: payloadBase satisfies UpdateVehicleFuelingDTO,
    });
    router.push(`/vehicle-fuelings/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo abastecimento" : "Editar abastecimento"}
        </CardTitle>
        <CardDescription>
          Registre abastecimentos vinculados a emprestimos, cautelas ou
          manutencoes da frota.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Veiculo</Label>
              <Select
                value={selectedVehicleId || "none"}
                onValueChange={(value) => {
                  setValue("vehicle_id", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setValue("context_id", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
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
              <Label>Contexto operacional</Label>
              <Select
                value={selectedContextType || "none"}
                onValueChange={(value) => {
                  setValue("context_type", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setValue("context_id", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contexto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o contexto</SelectItem>
                  {vehicleFuelingContextOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.context_type ? (
                <p className="text-sm text-destructive">
                  {errors.context_type.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Registro relacionado</Label>
              <Select
                value={selectedContextId || "none"}
                onValueChange={(value) =>
                  setValue("context_id", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o registro relacionado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Selecione o registro relacionado
                  </SelectItem>
                  {contextOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.context_id ? (
                <p className="text-sm text-destructive">
                  {errors.context_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Responsavel pelo abastecimento</Label>
              <Select
                value={selectedFueledByUserId || "none"}
                onValueChange={(value) =>
                  setValue(
                    "fueled_by_user_id",
                    value === "none" ? "none" : value,
                    {
                      shouldDirty: true,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nao informado</SelectItem>
                  {(usersQuery.data?.data ?? []).map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="fueling_date">Data</Label>
              <Input id="fueling_date" type="date" {...register("fueling_date")} />
              {errors.fueling_date ? (
                <p className="text-sm text-destructive">
                  {errors.fueling_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fueling_time">Hora</Label>
              <Input id="fueling_time" type="time" {...register("fueling_time")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="km">Quilometragem</Label>
              <Input id="km" type="number" min={0} {...register("km")} />
              {errors.km ? (
                <p className="text-sm text-destructive">{errors.km.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Combustivel</Label>
              <Select
                value={selectedFuelType || "none"}
                onValueChange={(value) =>
                  setValue("fuel_type", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o combustivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o combustivel</SelectItem>
                  {vehicleFuelTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fuel_type ? (
                <p className="text-sm text-destructive">
                  {errors.fuel_type.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="liters">Litros</Label>
              <Input
                id="liters"
                type="number"
                min={0}
                step="0.01"
                {...register("liters")}
              />
              {errors.liters ? (
                <p className="text-sm text-destructive">
                  {errors.liters.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_liter">Preco por litro</Label>
              <Input
                id="price_per_liter"
                type="number"
                min={0}
                step="0.001"
                {...register("price_per_liter")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_cost">Custo total</Label>
              <Input
                id="total_cost"
                type="number"
                min={0}
                step="0.01"
                {...register("total_cost")}
              />
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gas_station">Posto</Label>
              <Input id="gas_station" {...register("gas_station")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gas_station_city">Cidade do posto</Label>
              <Input id="gas_station_city" {...register("gas_station_city")} />
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Numero do cupom/nota</Label>
              <Input id="invoice_number" {...register("invoice_number")} />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Checkbox
                checked={isFullTank}
                onCheckedChange={(checked) =>
                  setValue("is_full_tank", Boolean(checked), {
                    shouldDirty: true,
                  })
                }
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Tanque cheio
                </p>
                <p className="text-xs text-slate-500">
                  Marque se o abastecimento completou o tanque.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              rows={5}
              placeholder="Informacoes adicionais sobre o abastecimento"
              {...register("notes")}
            />
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="ghost">
              <Link
                href={
                  fueling ? `/vehicle-fuelings/${fueling.id}` : "/vehicle-fuelings"
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Registrar abastecimento"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
