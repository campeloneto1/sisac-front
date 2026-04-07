"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreateVehicleCustodyMutation,
  useUpdateVehicleCustodyMutation,
} from "@/hooks/use-vehicle-custody-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { useUsers } from "@/hooks/use-users";
import { useAvailableVehicles, useVehicles } from "@/hooks/use-vehicles";
import type {
  CreateVehicleCustodyDTO,
  UpdateVehicleCustodyDTO,
  VehicleCustodyCustodianType,
  VehicleCustodyItem,
} from "@/types/vehicle-custody.type";
import { vehicleCustodyCustodianTypeOptions } from "@/types/vehicle-custody.type";
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

const vehicleCustodyFormSchema = z.object({
  vehicle_id: z.string().min(1),
  custodian_type: z.string().min(1),
  custodian_id: z.string().min(1),
  document_number: z
    .string()
    .max(100, "O documento deve ter no maximo 100 caracteres."),
  end_date: z.string(),
  reason: z.string().max(5000, "O motivo deve ter no maximo 5000 caracteres."),
  notes: z
    .string()
    .max(5000, "As observacoes devem ter no maximo 5000 caracteres."),
  start_date: z.string(),
});

type VehicleCustodyFormValues = z.output<typeof vehicleCustodyFormSchema>;

interface VehicleCustodyFormProps {
  mode: "create" | "edit";
  custody?: VehicleCustodyItem;
}

export function VehicleCustodyForm({
  mode,
  custody,
}: VehicleCustodyFormProps) {
  const router = useRouter();
  const createMutation = useCreateVehicleCustodyMutation();
  const updateMutation = useUpdateVehicleCustodyMutation();
  const vehiclesQuery = useVehicles(
    { per_page: 100 },
    { enabled: mode === "edit" },
  );
  const availableVehiclesQuery = useAvailableVehicles(
    { per_page: 100 },
    { enabled: mode === "create" },
  );
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });

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
      vehicle_id: custody?.vehicle_id ? String(custody.vehicle_id) : "",
      custodian_type: custody?.custodian_type ?? "",
      custodian_id: custody?.custodian_id ? String(custody.custodian_id) : "",
      document_number: custody?.document_number ?? "",
      end_date: custody?.end_date ?? "",
      reason: custody?.reason ?? "",
      notes: custody?.notes ?? "",
      start_date: custody?.start_date ?? "",
    },
  });

  const selectedVehicleId = useWatch({ control, name: "vehicle_id" });
  const selectedCustodianType = useWatch({ control, name: "custodian_type" });
  const selectedCustodianId = useWatch({ control, name: "custodian_id" });

  useEffect(() => {
    if (!custody) {
      return;
    }

    reset({
      vehicle_id: String(custody.vehicle_id),
      custodian_type: custody.custodian_type,
      custodian_id: String(custody.custodian_id),
      document_number: custody.document_number ?? "",
      end_date: custody.end_date ?? "",
      reason: custody.reason ?? "",
      notes: custody.notes ?? "",
      start_date: custody.start_date ?? "",
    });
  }, [custody, reset]);

  const availableCustodians =
    selectedCustodianType === "App\\Models\\PoliceOfficer"
      ? (policeOfficersQuery.data?.data ?? []).map((officer) => ({
          value: String(officer.id),
          label:
            officer.war_name || officer.name || officer.registration_number || "",
          detail: officer.registration_number || "",
        }))
      : selectedCustodianType === "App\\Models\\User"
        ? (usersQuery.data?.data ?? []).map((user) => ({
            value: String(user.id),
            label: user.name,
            detail: user.email,
          }))
        : [];
  const selectableVehicles =
    mode === "create"
      ? (availableVehiclesQuery.data?.data ?? [])
      : (vehiclesQuery.data?.data ?? []);

  async function onSubmit(values: VehicleCustodyFormValues) {
    const payloadBase = {
      vehicle_id: Number(values.vehicle_id),
      custodian_type: values.custodian_type as VehicleCustodyCustodianType,
      custodian_id: Number(values.custodian_id),
      document_number: values.document_number.trim() || null,
      end_date: values.end_date || null,
      reason: values.reason.trim() || null,
      notes: values.notes.trim() || null,
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
      payload: {
        ...payloadBase,
        start_date: values.start_date || null,
      } satisfies UpdateVehicleCustodyDTO,
    });

    router.push(`/vehicle-custodies/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Nova cautela" : "Editar cautela"}
        </CardTitle>
        <CardDescription>
          O inicio, status e contexto da subunidade ativa sao definidos
          automaticamente pela API.
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
                  {selectableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                      {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle_id ? (
                <p className="text-sm text-destructive">
                  Selecione um veiculo.
                </p>
              ) : null}
            </div>

            {mode === "edit" ? (
              <div className="space-y-2">
                <Label htmlFor="start_date">Data de inicio</Label>
                <Input id="start_date" type="date" {...register("start_date")} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Inicio automatico</Label>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  A data de inicio sera registrada automaticamente ao criar a
                  cautela.
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de custodiante</Label>
              <Select
                value={selectedCustodianType || "none"}
                onValueChange={(value) => {
                  setValue("custodian_type", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  setValue("custodian_id", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o tipo</SelectItem>
                  {vehicleCustodyCustodianTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custodiante</Label>
              <Select
                value={selectedCustodianId || "none"}
                onValueChange={(value) =>
                  setValue("custodian_id", value === "none" ? "" : value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o custodiante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o custodiante</SelectItem>
                  {availableCustodians.map((custodian) => (
                    <SelectItem key={custodian.value} value={custodian.value}>
                      {custodian.detail
                        ? `${custodian.label} • ${custodian.detail}`
                        : custodian.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="document_number">Documento</Label>
              <Input
                id="document_number"
                placeholder="Numero do documento"
                {...register("document_number")}
              />
              {errors.document_number ? (
                <p className="text-sm text-destructive">
                  {errors.document_number.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fim previsto</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Textarea
                id="reason"
                placeholder="Motivo da cautela"
                {...register("reason")}
              />
              {errors.reason ? (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                placeholder="Observacoes complementares"
                {...register("notes")}
              />
              {errors.notes ? (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
                </p>
              ) : null}
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
            <Button type="submit" disabled={isPending}>
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
