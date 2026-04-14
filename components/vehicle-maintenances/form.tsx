"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVehicleMaintenanceMutation,
  useUpdateVehicleMaintenanceMutation,
} from "@/hooks/use-vehicle-maintenance-mutations";
import { useWorkshops } from "@/hooks/use-workshops";
import { formatVehicleOptionLabel } from "@/lib/option-labels";
import { vehiclesService } from "@/services/vehicles/service";
import type {
  CreateVehicleMaintenanceDTO,
  UpdateVehicleMaintenanceDTO,
  VehicleMaintenanceItem,
} from "@/types/vehicle-maintenance.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import {
  vehicleMaintenanceStatusOptions,
  vehicleMaintenanceTypeOptions,
} from "@/types/vehicle-maintenance.type";
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

const replacedPartSchema = z.object({
  part: z.string().min(1, "Informe a peça."),
  quantity: z.number().int().min(1, "A quantidade deve ser ao menos 1."),
  cost: z.union([z.number().min(0), z.literal("")]).optional(),
});

const vehicleMaintenanceFormSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione um veículo."),
  workshop_id: z.string(),
  maintenance_type: z.string().min(1, "Selecione o tipo."),
  description: z
    .string()
    .min(3, "A descrição deve ter ao menos 3 caracteres.")
    .max(1000, "A descrição deve ter no máximo 1000 caracteres."),
  entry_date: z.string().min(1, "Informe a data de entrada."),
  entry_time: z.string(),
  entry_km: z.number().int().min(0, "Informe uma quilometragem válida."),
  exit_date: z.string().optional().or(z.literal("")),
  exit_time: z.string().optional().or(z.literal("")),
  exit_km: z.union([z.number().int().min(0), z.literal("")]),
  expected_completion_date: z.string().optional().or(z.literal("")),
  cost: z.union([z.number().min(0), z.literal("")]),
  parts_cost: z.union([z.number().min(0), z.literal("")]),
  labor_cost: z.union([z.number().min(0), z.literal("")]),
  status: z.string(),
  notes: z
    .string()
    .max(2000, "As observações devem ter no máximo 2000 caracteres."),
  replaced_parts: z.array(replacedPartSchema),
});

type VehicleMaintenanceFormValues = z.output<
  typeof vehicleMaintenanceFormSchema
>;

interface VehicleMaintenanceFormProps {
  mode: "create" | "edit";
  maintenance?: VehicleMaintenanceItem;
}

function parseNumberField(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : Number(value);
}

export function VehicleMaintenanceForm({
  mode,
  maintenance,
}: VehicleMaintenanceFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleMaintenanceMutation();
  const updateMutation = useUpdateVehicleMaintenanceMutation();
  const workshopsQuery = useWorkshops({ per_page: 100 });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof vehicleMaintenanceFormSchema>,
    unknown,
    VehicleMaintenanceFormValues
  >({
    resolver: zodResolver(vehicleMaintenanceFormSchema),
    defaultValues: {
      vehicle_id: maintenance?.vehicle_id ? String(maintenance.vehicle_id) : "",
      workshop_id: maintenance?.workshop_id
        ? String(maintenance.workshop_id)
        : "none",
      maintenance_type: maintenance?.maintenance_type ?? "",
      description: maintenance?.description ?? "",
      entry_date: maintenance?.entry_date ?? "",
      entry_time: maintenance?.entry_time ?? "",
      entry_km: maintenance?.entry_km ?? 0,
      exit_date: maintenance?.exit_date ?? "",
      exit_time: maintenance?.exit_time ?? "",
      exit_km: maintenance?.exit_km ?? "",
      expected_completion_date: maintenance?.expected_completion_date ?? "",
      cost: maintenance?.cost ? Number(maintenance.cost) : "",
      parts_cost: maintenance?.parts_cost ? Number(maintenance.parts_cost) : "",
      labor_cost: maintenance?.labor_cost ? Number(maintenance.labor_cost) : "",
      status: maintenance?.status ?? "in_progress",
      notes: maintenance?.notes ?? "",
      replaced_parts:
        maintenance?.replaced_parts?.map((part) => ({
          part: part.part,
          quantity: part.quantity,
          cost: part.cost ? Number(part.cost) : "",
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "replaced_parts",
  });

  const selectedVehicleId = useWatch({ control, name: "vehicle_id" });
  const selectedWorkshopId = useWatch({ control, name: "workshop_id" });
  const selectedMaintenanceType = useWatch({
    control,
    name: "maintenance_type",
  });
  const selectedStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    if (!maintenance) {
      return;
    }

    reset({
      vehicle_id: String(maintenance.vehicle_id),
      workshop_id: maintenance.workshop_id
        ? String(maintenance.workshop_id)
        : "none",
      maintenance_type: maintenance.maintenance_type ?? "",
      description: maintenance.description ?? "",
      entry_date: maintenance.entry_date ?? "",
      entry_time: maintenance.entry_time ?? "",
      entry_km: maintenance.entry_km ?? 0,
      exit_date: maintenance.exit_date ?? "",
      exit_time: maintenance.exit_time ?? "",
      exit_km: maintenance.exit_km ?? "",
      expected_completion_date: maintenance.expected_completion_date ?? "",
      cost: maintenance.cost ? Number(maintenance.cost) : "",
      parts_cost: maintenance.parts_cost ? Number(maintenance.parts_cost) : "",
      labor_cost: maintenance.labor_cost ? Number(maintenance.labor_cost) : "",
      status: maintenance.status ?? "in_progress",
      notes: maintenance.notes ?? "",
      replaced_parts:
        maintenance.replaced_parts?.map((part) => ({
          part: part.part,
          quantity: part.quantity,
          cost: part.cost ? Number(part.cost) : "",
        })) ?? [],
    });
  }, [maintenance, reset]);

  async function onSubmit(values: VehicleMaintenanceFormValues) {
    const payload = {
      vehicle_id: Number(values.vehicle_id),
      workshop_id:
        values.workshop_id && values.workshop_id !== "none"
          ? Number(values.workshop_id)
          : null,
      maintenance_type:
        values.maintenance_type as CreateVehicleMaintenanceDTO["maintenance_type"],
      description: values.description.trim(),
      entry_date: values.entry_date,
      entry_time: values.entry_time || null,
      entry_km: Number(values.entry_km),
      exit_date: values.exit_date || null,
      exit_time: values.exit_time || null,
      exit_km: parseNumberField(values.exit_km),
      expected_completion_date: values.expected_completion_date || null,
      cost: parseNumberField(values.cost),
      parts_cost: parseNumberField(values.parts_cost),
      labor_cost: parseNumberField(values.labor_cost),
      status: values.status
        ? (values.status as CreateVehicleMaintenanceDTO["status"])
        : undefined,
      notes: values.notes.trim() || null,
      replaced_parts: values.replaced_parts.length
        ? values.replaced_parts.map((part) => ({
            part: part.part.trim(),
            quantity: Number(part.quantity),
            cost: parseNumberField(part.cost),
          }))
        : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateVehicleMaintenanceDTO,
      );
      router.push(`/vehicle-maintenances/${response.data.id}`);
      return;
    }

    if (!maintenance) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: maintenance.id,
      payload: payload satisfies UpdateVehicleMaintenanceDTO,
    });
    router.push(`/vehicle-maintenances/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedVehicleOption = maintenance?.vehicle
    ? {
        value: String(maintenance.vehicle_id),
        label: formatVehicleOptionLabel({
          ...maintenance.vehicle,
          id: maintenance.vehicle_id,
        }),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova manutenção" : "Editar manutenção"}
        </CardTitle>
        <CardDescription>
          Veículos indisponiveis por empréstimo, cautela ou manutenção ativa não
          aparecem na criação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Veículo</Label>
              <AsyncSearchableSelect
                value={selectedVehicleId || undefined}
                onValueChange={(value) =>
                  setValue("vehicle_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                queryKey={["vehicle-maintenances", "vehicles", mode]}
                loadPage={({ page, search }) =>
                  (mode === "create"
                    ? vehiclesService.available
                    : vehiclesService.index)({
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
              <Label>Oficina</Label>
              <Select
                value={selectedWorkshopId || "none"}
                onValueChange={(value) =>
                  setValue("workshop_id", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma oficina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informar oficina</SelectItem>
                  {(workshopsQuery.data?.data ?? []).map((workshop) => (
                    <SelectItem key={workshop.id} value={String(workshop.id)}>
                      {workshop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de manutenção</Label>
              <Select
                value={selectedMaintenanceType || "none"}
                onValueChange={(value) =>
                  setValue("maintenance_type", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o tipo</SelectItem>
                  {vehicleMaintenanceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.maintenance_type ? (
                <p className="text-sm text-destructive">
                  {errors.maintenance_type.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus || "in_progress"}
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
                  {vehicleMaintenanceStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="entry_date">Data de entrada</Label>
              <Input id="entry_date" type="date" {...register("entry_date")} />
              {errors.entry_date ? (
                <p className="text-sm text-destructive">
                  {errors.entry_date.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_time">Hora de entrada</Label>
              <Input id="entry_time" type="time" {...register("entry_time")} />
              {errors.entry_time ? (
                <p className="text-sm text-destructive">
                  {errors.entry_time.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_km">KM de entrada</Label>
              <Input
                id="entry_km"
                type="number"
                min={0}
                {...register("entry_km", { valueAsNumber: true })}
              />
              {errors.entry_km ? (
                <p className="text-sm text-destructive">
                  {errors.entry_km.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="exit_date">Data de saida (opcional)</Label>
              <Input id="exit_date" type="date" {...register("exit_date")} />
              {errors.exit_date ? (
                <p className="text-sm text-destructive">
                  {errors.exit_date.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Preencher quando a manutenção for concluída.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit_time">Hora de saida (opcional)</Label>
              <Input id="exit_time" type="time" {...register("exit_time")} />
              {errors.exit_time ? (
                <p className="text-sm text-destructive">
                  {errors.exit_time.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit_km">KM de saida (opcional)</Label>
              <Input
                id="exit_km"
                type="number"
                min={0}
                {...register("exit_km", { valueAsNumber: true })}
              />
              {errors.exit_km ? (
                <p className="text-sm text-destructive">
                  {errors.exit_km.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_completion_date">
                Previsao de conclusão (opcional)
              </Label>
              <Input
                id="expected_completion_date"
                type="date"
                {...register("expected_completion_date")}
              />
              {errors.expected_completion_date ? (
                <p className="text-sm text-destructive">
                  {errors.expected_completion_date.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cost">Custo total</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min={0}
                {...register("cost", { valueAsNumber: true })}
              />
              {errors.cost ? (
                <p className="text-sm text-destructive">{errors.cost.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="parts_cost">Custo de pecas</Label>
              <Input
                id="parts_cost"
                type="number"
                step="0.01"
                min={0}
                {...register("parts_cost", { valueAsNumber: true })}
              />
              {errors.parts_cost ? (
                <p className="text-sm text-destructive">
                  {errors.parts_cost.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="labor_cost">Custo de mao de obra</Label>
              <Input
                id="labor_cost"
                type="number"
                step="0.01"
                min={0}
                {...register("labor_cost", { valueAsNumber: true })}
              />
              {errors.labor_cost ? (
                <p className="text-sm text-destructive">
                  {errors.labor_cost.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Pecas substituidas</Label>
                <p className="text-sm text-slate-500">
                  Adicione somente se houver controle detalhado de pecas.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ part: "", quantity: 1, cost: "" })}
              >
                Adicionar peça
              </Button>
            </div>

            <div className="space-y-4">
              {fields.length ? (
                fields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <div className="grid gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 md:grid-cols-[1.6fr_0.7fr_0.9fr_auto]">
                      <div>
                        <Input
                          placeholder="Nome da peça"
                          {...register(`replaced_parts.${index}.part`)}
                        />
                        {errors.replaced_parts?.[index]?.part ? (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.replaced_parts[index]?.part?.message}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Qtd."
                          {...register(`replaced_parts.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.replaced_parts?.[index]?.quantity ? (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.replaced_parts[index]?.quantity?.message}
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Custo"
                          {...register(`replaced_parts.${index}.cost`, {
                            valueAsNumber: true,
                          })}
                        />
                        {errors.replaced_parts?.[index]?.cost ? (
                          <p className="mt-1 text-xs text-destructive">
                            {errors.replaced_parts[index]?.cost?.message}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Nenhuma peça adicionada.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={5} {...register("notes")} />
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="ghost">
              <Link
                href={
                  maintenance
                    ? `/vehicle-maintenances/${maintenance.id}`
                    : "/vehicle-maintenances"
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar manutenção"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
