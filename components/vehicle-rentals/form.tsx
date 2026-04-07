"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCompanies } from "@/hooks/use-companies";
import {
  useCreateVehicleRentalMutation,
  useUpdateVehicleRentalMutation,
} from "@/hooks/use-vehicle-rental-mutations";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  CreateVehicleRentalDTO,
  UpdateVehicleRentalDTO,
  VehicleRentalItem,
} from "@/types/vehicle-rental.type";
import { vehicleRentalStatusOptions } from "@/types/vehicle-rental.type";
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

const vehicleRentalFormSchema = z
  .object({
    vehicle_id: z.string().min(1, "Selecione um veiculo."),
    company_id: z.string().min(1, "Selecione a locadora."),
    contract_number: z
      .string()
      .max(50, "O numero do contrato deve ter no maximo 50 caracteres."),
    contract_start_date: z
      .string()
      .min(1, "Informe a data de inicio do contrato."),
    contract_end_date: z.string(),
    actual_start_date: z.string(),
    actual_end_date: z.string(),
    daily_cost: z.union([z.coerce.number().min(0), z.literal("")]),
    monthly_cost: z.union([z.coerce.number().min(0), z.literal("")]),
    entry_km: z.union([z.coerce.number().int().min(0), z.literal("")]),
    exit_km: z.union([z.coerce.number().int().min(0), z.literal("")]),
    status: z.string(),
    returned_to_company_date: z.string(),
    returned_from_company_date: z.string(),
    notes: z
      .string()
      .max(5000, "As observacoes devem ter no maximo 5000 caracteres."),
  })
  .superRefine((values, ctx) => {
    if (!values.daily_cost && !values.monthly_cost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["daily_cost"],
        message: "Informe ao menos um custo: diario ou mensal.",
      });
    }

    if (
      values.contract_start_date &&
      values.contract_end_date &&
      values.contract_end_date < values.contract_start_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contract_end_date"],
        message: "A data final do contrato deve ser posterior ou igual a inicial.",
      });
    }

    if (
      values.actual_start_date &&
      values.actual_end_date &&
      values.actual_end_date < values.actual_start_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["actual_end_date"],
        message: "A data final real deve ser posterior ou igual a inicial real.",
      });
    }

    if (
      values.entry_km !== "" &&
      values.exit_km !== "" &&
      Number(values.exit_km) < Number(values.entry_km)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exit_km"],
        message: "A quilometragem de saida deve ser maior ou igual a de entrada.",
      });
    }
  });

type VehicleRentalFormValues = z.output<typeof vehicleRentalFormSchema>;

interface VehicleRentalFormProps {
  mode: "create" | "edit";
  rental?: VehicleRentalItem;
}

function parseNumberField(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : Number(value);
}

export function VehicleRentalForm({
  mode,
  rental,
}: VehicleRentalFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleRentalMutation();
  const updateMutation = useUpdateVehicleRentalMutation();
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const companiesQuery = useCompanies({ per_page: 100 });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof vehicleRentalFormSchema>,
    unknown,
    VehicleRentalFormValues
  >({
    resolver: zodResolver(vehicleRentalFormSchema),
    defaultValues: {
      vehicle_id: rental?.vehicle_id ? String(rental.vehicle_id) : "",
      company_id: rental?.company_id ? String(rental.company_id) : "",
      contract_number: rental?.contract_number ?? "",
      contract_start_date: rental?.contract_start_date ?? "",
      contract_end_date: rental?.contract_end_date ?? "",
      actual_start_date: rental?.actual_start_date ?? "",
      actual_end_date: rental?.actual_end_date ?? "",
      daily_cost: rental?.daily_cost ?? "",
      monthly_cost: rental?.monthly_cost ?? "",
      entry_km: rental?.entry_km ?? "",
      exit_km: rental?.exit_km ?? "",
      status: rental?.status ?? "active",
      returned_to_company_date: rental?.returned_to_company_date ?? "",
      returned_from_company_date: rental?.returned_from_company_date ?? "",
      notes: rental?.notes ?? "",
    },
  });

  const selectedVehicleId = useWatch({ control, name: "vehicle_id" });
  const selectedCompanyId = useWatch({ control, name: "company_id" });
  const selectedStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    if (!rental) {
      return;
    }

    reset({
      vehicle_id: String(rental.vehicle_id),
      company_id: String(rental.company_id),
      contract_number: rental.contract_number ?? "",
      contract_start_date: rental.contract_start_date ?? "",
      contract_end_date: rental.contract_end_date ?? "",
      actual_start_date: rental.actual_start_date ?? "",
      actual_end_date: rental.actual_end_date ?? "",
      daily_cost: rental.daily_cost ?? "",
      monthly_cost: rental.monthly_cost ?? "",
      entry_km: rental.entry_km ?? "",
      exit_km: rental.exit_km ?? "",
      status: rental.status ?? "active",
      returned_to_company_date: rental.returned_to_company_date ?? "",
      returned_from_company_date: rental.returned_from_company_date ?? "",
      notes: rental.notes ?? "",
    });
  }, [rental, reset]);

  async function onSubmit(values: VehicleRentalFormValues) {
    const payload = {
      vehicle_id: Number(values.vehicle_id),
      company_id: Number(values.company_id),
      contract_number: values.contract_number.trim() || null,
      contract_start_date: values.contract_start_date,
      contract_end_date: values.contract_end_date || null,
      actual_start_date: values.actual_start_date || null,
      actual_end_date: values.actual_end_date || null,
      daily_cost: parseNumberField(values.daily_cost),
      monthly_cost: parseNumberField(values.monthly_cost),
      entry_km: parseNumberField(values.entry_km),
      exit_km: parseNumberField(values.exit_km),
      status: values.status
        ? (values.status as CreateVehicleRentalDTO["status"])
        : undefined,
      returned_to_company_date: values.returned_to_company_date || null,
      returned_from_company_date: values.returned_from_company_date || null,
      notes: values.notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateVehicleRentalDTO,
      );
      router.push(`/vehicle-rentals/${response.data.id}`);
      return;
    }

    if (!rental) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: rental.id,
      payload: payload satisfies UpdateVehicleRentalDTO,
    });
    router.push(`/vehicle-rentals/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova locacao" : "Editar locacao"}
        </CardTitle>
        <CardDescription>
          Controle o contrato com a locadora, os custos e o ciclo real de uso
          do veiculo alugado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Veiculo</Label>
              <Select
                value={selectedVehicleId || "none"}
                onValueChange={(value) =>
                  setValue("vehicle_id", value === "none" ? "" : value, {
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
              <Label>Locadora</Label>
              <Select
                value={selectedCompanyId || "none"}
                onValueChange={(value) =>
                  setValue("company_id", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a locadora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione a locadora</SelectItem>
                  {(companiesQuery.data?.data ?? []).map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.trade_name || company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company_id ? (
                <p className="text-sm text-destructive">
                  {errors.company_id.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_number">Numero do contrato</Label>
              <Input id="contract_number" {...register("contract_number")} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus || "active"}
                onValueChange={(value) =>
                  setValue("status", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleRentalStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="contract_start_date">Inicio do contrato</Label>
              <Input
                id="contract_start_date"
                type="date"
                {...register("contract_start_date")}
              />
              {errors.contract_start_date ? (
                <p className="text-sm text-destructive">
                  {errors.contract_start_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_end_date">Fim do contrato</Label>
              <Input
                id="contract_end_date"
                type="date"
                {...register("contract_end_date")}
              />
              {errors.contract_end_date ? (
                <p className="text-sm text-destructive">
                  {errors.contract_end_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_start_date">Inicio real</Label>
              <Input
                id="actual_start_date"
                type="date"
                {...register("actual_start_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_end_date">Fim real</Label>
              <Input
                id="actual_end_date"
                type="date"
                {...register("actual_end_date")}
              />
              {errors.actual_end_date ? (
                <p className="text-sm text-destructive">
                  {errors.actual_end_date.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="daily_cost">Custo diario</Label>
              <Input
                id="daily_cost"
                type="number"
                min={0}
                step="0.01"
                {...register("daily_cost")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_cost">Custo mensal</Label>
              <Input
                id="monthly_cost"
                type="number"
                min={0}
                step="0.01"
                {...register("monthly_cost")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_km">KM entrada</Label>
              <Input
                id="entry_km"
                type="number"
                min={0}
                {...register("entry_km")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit_km">KM saida</Label>
              <Input
                id="exit_km"
                type="number"
                min={0}
                {...register("exit_km")}
              />
              {errors.exit_km ? (
                <p className="text-sm text-destructive">
                  {errors.exit_km.message}
                </p>
              ) : null}
            </div>
          </section>

          {errors.daily_cost ? (
            <p className="text-sm text-destructive">{errors.daily_cost.message}</p>
          ) : null}

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="returned_to_company_date">
                Devolvido para a locadora em
              </Label>
              <Input
                id="returned_to_company_date"
                type="date"
                {...register("returned_to_company_date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returned_from_company_date">
                Retornou da locadora em
              </Label>
              <Input
                id="returned_from_company_date"
                type="date"
                {...register("returned_from_company_date")}
              />
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              rows={5}
              placeholder="Informacoes complementares sobre a locacao"
              {...register("notes")}
            />
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="ghost">
              <Link
                href={rental ? `/vehicle-rentals/${rental.id}` : "/vehicle-rentals"}
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Registrar locacao"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
