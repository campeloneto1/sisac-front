"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVehicleDamageMutation,
  useUpdateVehicleDamageMutation,
} from "@/hooks/use-vehicle-damage-mutations";
import { useUsers } from "@/hooks/use-users";
import { useVehicleCustodies } from "@/hooks/use-vehicle-custodies";
import { useVehicleLoans } from "@/hooks/use-vehicle-loans";
import { useVehicleMaintenances } from "@/hooks/use-vehicle-maintenances";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  CreateVehicleDamageDTO,
  UpdateVehicleDamageDTO,
  VehicleDamageContextType,
  VehicleDamageItem,
} from "@/types/vehicle-damage.type";
import {
  getVehicleDamageContextType,
  vehicleDamageContextOptions,
  vehicleDamageDetectionMomentOptions,
  vehicleDamageSeverityOptions,
  vehicleDamageStatusOptions,
  vehicleDamageTypeOptions,
} from "@/types/vehicle-damage.type";
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

const photoSchema = z.object({
  value: z.string().trim().max(500, "A URL da foto deve ter no máximo 500 caracteres."),
});

const vehicleDamageFormSchema = z
  .object({
    vehicle_id: z.string().min(1, "Selecione um veículo."),
    context_type: z.string(),
    context_id: z.string(),
    detected_date: z.string(),
    detected_time: z.string(),
    detection_moment: z.string().min(1, "Selecione o momento da deteccao."),
    damage_type: z.string().min(1, "Selecione o tipo de dano."),
    location: z
      .string()
      .min(3, "Informe o local do dano.")
      .max(100, "O local deve ter no máximo 100 caracteres."),
    description: z
      .string()
      .min(5, "A descrição deve ter ao menos 5 caracteres.")
      .max(1000, "A descrição deve ter no máximo 1000 caracteres."),
    severity: z.string(),
    photos: z.array(photoSchema),
    responsible_user_id: z.string(),
    responsible_external_name: z
      .string()
      .max(100, "O nome do responsável externo deve ter no máximo 100 caracteres."),
    estimated_repair_cost: z.union([z.number().min(0), z.literal("")]),
    actual_repair_cost: z.union([z.number().min(0), z.literal("")]),
    status: z.string(),
    repair_date: z.string(),
    notes: z
      .string()
      .max(2000, "As observações devem ter no máximo 2000 caracteres."),
  })
  .superRefine((values, ctx) => {
    if (
      (values.context_type && !values.context_id) ||
      (!values.context_type && values.context_id)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["context_id"],
        message: "Selecione o registro relacionado ao contexto informado.",
      });
    }

    if (
      values.detected_date &&
      values.repair_date &&
      values.repair_date < values.detected_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["repair_date"],
        message: "A data de reparo deve ser posterior ou igual a deteccao.",
      });
    }
  });

type VehicleDamageFormValues = z.output<typeof vehicleDamageFormSchema>;

interface VehicleDamageFormProps {
  mode: "create" | "edit";
  damage?: VehicleDamageItem;
}

function parseNumberField(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : Number(value);
}

function normalizeTime(value: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? value : value.slice(0, 5);
}

export function VehicleDamageForm({ mode, damage }: VehicleDamageFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleDamageMutation();
  const updateMutation = useUpdateVehicleDamageMutation();
  const vehiclesQuery = useVehicles({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });
  const activeLoansQuery = useVehicleLoans(
    mode === "create" ? { per_page: 100, status: "in_use" } : { per_page: 100 },
  );
  const activeCustodiesQuery = useVehicleCustodies(
    mode === "create" ? { per_page: 100, status: "active" } : { per_page: 100 },
  );
  const maintenancesQuery = useVehicleMaintenances({ per_page: 100 });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof vehicleDamageFormSchema>,
    unknown,
    VehicleDamageFormValues
  >({
    resolver: zodResolver(vehicleDamageFormSchema),
    defaultValues: {
      vehicle_id: damage?.vehicle_id ? String(damage.vehicle_id) : "",
      context_type: getVehicleDamageContextType(damage) ?? "none",
      context_id: String(
        damage?.vehicle_loan_id ??
          damage?.vehicle_custody_id ??
          damage?.vehicle_maintenance_id ??
          "",
      ),
      detected_date: damage?.detected_date ?? "",
      detected_time: damage?.detected_time?.slice(0, 5) ?? "",
      detection_moment: damage?.detection_moment ?? "",
      damage_type: damage?.damage_type ?? "",
      location: damage?.location ?? "",
      description: damage?.description ?? "",
      severity: damage?.severity ?? "minor",
      photos: damage?.photos?.map((photo) => ({ value: photo })) ?? [],
      responsible_user_id: damage?.responsible_user_id
        ? String(damage.responsible_user_id)
        : "none",
      responsible_external_name: damage?.responsible_external_name ?? "",
      estimated_repair_cost: damage?.estimated_repair_cost ?? "",
      actual_repair_cost: damage?.actual_repair_cost ?? "",
      status: damage?.status ?? "pending",
      repair_date: damage?.repair_date ?? "",
      notes: damage?.notes ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "photos",
  });

  const selectedVehicleId = useWatch({ control, name: "vehicle_id" });
  const selectedContextType = useWatch({ control, name: "context_type" });
  const selectedContextId = useWatch({ control, name: "context_id" });
  const selectedDetectionMoment = useWatch({
    control,
    name: "detection_moment",
  });
  const selectedDamageType = useWatch({ control, name: "damage_type" });
  const selectedSeverity = useWatch({ control, name: "severity" });
  const selectedResponsibleUserId = useWatch({
    control,
    name: "responsible_user_id",
  });
  const selectedStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    if (!damage) {
      return;
    }

    reset({
      vehicle_id: String(damage.vehicle_id),
      context_type: getVehicleDamageContextType(damage) ?? "none",
      context_id: String(
        damage.vehicle_loan_id ??
          damage.vehicle_custody_id ??
          damage.vehicle_maintenance_id ??
          "",
      ),
      detected_date: damage.detected_date ?? "",
      detected_time: damage.detected_time?.slice(0, 5) ?? "",
      detection_moment: damage.detection_moment ?? "",
      damage_type: damage.damage_type ?? "",
      location: damage.location ?? "",
      description: damage.description ?? "",
      severity: damage.severity ?? "minor",
      photos: damage.photos?.map((photo) => ({ value: photo })) ?? [],
      responsible_user_id: damage.responsible_user_id
        ? String(damage.responsible_user_id)
        : "none",
      responsible_external_name: damage.responsible_external_name ?? "",
      estimated_repair_cost: damage.estimated_repair_cost ?? "",
      actual_repair_cost: damage.actual_repair_cost ?? "",
      status: damage.status ?? "pending",
      repair_date: damage.repair_date ?? "",
      notes: damage.notes ?? "",
    });
  }, [damage, reset]);

  const contextOptions = useMemo(() => {
    if (selectedContextType === "vehicle_loan") {
      return (activeLoansQuery.data?.data ?? [])
        .filter((loan) =>
          selectedVehicleId ? String(loan.vehicle_id) === selectedVehicleId : true,
        )
        .map((loan) => ({
          value: String(loan.id),
          label: `${loan.vehicle?.license_plate ?? `#${loan.vehicle_id}`} • ${loan.status_label ?? "Empréstimo"}`,
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
      return (maintenancesQuery.data?.data ?? [])
        .filter((maintenance) =>
          selectedVehicleId
            ? String(maintenance.vehicle_id) === selectedVehicleId
            : true,
        )
        .map((maintenance) => ({
          value: String(maintenance.id),
          label: `${maintenance.vehicle?.license_plate ?? `#${maintenance.vehicle_id}`} • ${maintenance.maintenance_type_label ?? "Manutenção"}`,
        }));
    }

    return [];
  }, [
    activeCustodiesQuery.data?.data,
    activeLoansQuery.data?.data,
    maintenancesQuery.data?.data,
    selectedContextType,
    selectedVehicleId,
  ]);

  async function onSubmit(values: VehicleDamageFormValues) {
    const contextType =
      values.context_type && values.context_type !== "none"
        ? (values.context_type as VehicleDamageContextType)
        : null;
    const contextId = values.context_id ? Number(values.context_id) : null;

    const payload = {
      vehicle_id: Number(values.vehicle_id),
      vehicle_loan_id:
        contextType === "vehicle_loan" && contextId ? contextId : null,
      vehicle_custody_id:
        contextType === "vehicle_custody" && contextId ? contextId : null,
      vehicle_maintenance_id:
        contextType === "vehicle_maintenance" && contextId ? contextId : null,
      detected_date: values.detected_date || null,
      detected_time: normalizeTime(values.detected_time),
      detection_moment:
        values.detection_moment as CreateVehicleDamageDTO["detection_moment"],
      damage_type: values.damage_type as CreateVehicleDamageDTO["damage_type"],
      location: values.location.trim(),
      description: values.description.trim(),
      severity: values.severity
        ? (values.severity as CreateVehicleDamageDTO["severity"])
        : undefined,
      photos: values.photos.length
        ? values.photos
            .map((photo) => photo.value.trim())
            .filter(Boolean)
        : null,
      responsible_user_id:
        values.responsible_user_id && values.responsible_user_id !== "none"
          ? Number(values.responsible_user_id)
          : null,
      responsible_external_name: values.responsible_external_name.trim() || null,
      estimated_repair_cost: parseNumberField(values.estimated_repair_cost),
      actual_repair_cost: parseNumberField(values.actual_repair_cost),
      status: values.status
        ? (values.status as CreateVehicleDamageDTO["status"])
        : undefined,
      repair_date: values.repair_date || null,
      notes: values.notes.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payload satisfies CreateVehicleDamageDTO,
      );
      router.push(`/vehicle-damages/${response.data.id}`);
      return;
    }

    if (!damage) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: damage.id,
      payload: payload satisfies UpdateVehicleDamageDTO,
    });
    router.push(`/vehicle-damages/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo dano" : "Editar dano"}</CardTitle>
        <CardDescription>
          Registre o dano, o contexto operacional, a gravidade e os custos de
          reparo do veículo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Veículo</Label>
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
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione um veículo</SelectItem>
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
                  setValue("context_type", value === "none" ? "none" : value, {
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
                  <SelectItem value="none">Sem contexto</SelectItem>
                  {vehicleDamageContextOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Responsável interno</Label>
              <Select
                value={selectedResponsibleUserId || "none"}
                onValueChange={(value) =>
                  setValue(
                    "responsible_user_id",
                    value === "none" ? "none" : value,
                    {
                      shouldDirty: true,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informado</SelectItem>
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
              <Label htmlFor="detected_date">Data da deteccao</Label>
              <Input id="detected_date" type="date" {...register("detected_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detected_time">Hora da deteccao</Label>
              <Input id="detected_time" type="time" {...register("detected_time")} />
            </div>

            <div className="space-y-2">
              <Label>Momento da deteccao</Label>
              <Select
                value={selectedDetectionMoment || "none"}
                onValueChange={(value) =>
                  setValue("detection_moment", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o momento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o momento</SelectItem>
                  {vehicleDamageDetectionMomentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.detection_moment ? (
                <p className="text-sm text-destructive">
                  {errors.detection_moment.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo de dano</Label>
              <Select
                value={selectedDamageType || "none"}
                onValueChange={(value) =>
                  setValue("damage_type", value === "none" ? "" : value, {
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
                  {vehicleDamageTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.damage_type ? (
                <p className="text-sm text-destructive">
                  {errors.damage_type.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Local do dano</Label>
              <Input id="location" {...register("location")} />
              {errors.location ? (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Gravidade</Label>
              <Select
                value={selectedSeverity || "minor"}
                onValueChange={(value) =>
                  setValue("severity", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a gravidade" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleDamageSeverityOptions.map((option) => (
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
            <Textarea
              id="description"
              rows={4}
              placeholder="Descreva o dano identificado"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Fotos do dano</Label>
                <p className="text-sm text-slate-500">
                  Informe URLs retornadas por outro fluxo de upload, se houver.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ value: "" })}
              >
                Adicionar foto
              </Button>
            </div>

            {fields.length ? (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3">
                    <Input
                      placeholder="https://..."
                      {...register(`photos.${index}.value`)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => remove(index)}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Nenhuma foto adicionada.
              </div>
            )}
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_repair_cost">Custo estimado</Label>
              <Input
                id="estimated_repair_cost"
                type="number"
                min={0}
                step="0.01"
                {...register("estimated_repair_cost")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_repair_cost">Custo real</Label>
              <Input
                id="actual_repair_cost"
                type="number"
                min={0}
                step="0.01"
                {...register("actual_repair_cost")}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus || "pending"}
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
                  {vehicleDamageStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repair_date">Data do reparo</Label>
              <Input id="repair_date" type="date" {...register("repair_date")} />
              {errors.repair_date ? (
                <p className="text-sm text-destructive">
                  {errors.repair_date.message}
                </p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="responsible_external_name">
                Responsável externo
              </Label>
              <Input
                id="responsible_external_name"
                {...register("responsible_external_name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Informações complementares sobre o dano"
                {...register("notes")}
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button asChild type="button" variant="ghost">
              <Link
                href={damage ? `/vehicle-damages/${damage.id}` : "/vehicle-damages"}
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Registrar dano"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
