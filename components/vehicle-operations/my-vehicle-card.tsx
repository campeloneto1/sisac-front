"use client";

import { useMemo, useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldArray,
  type FieldArrayPath,
  type FieldErrors,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CarFront,
  CheckCircle2,
  Gauge,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { useCities } from "@/hooks/use-cities";
import {
  getAuthenticatedBorrowerType,
  useMyActiveVehicleLoan,
} from "@/hooks/use-my-active-vehicle-loan";
import { usePermissions } from "@/hooks/use-permissions";
import { useAvailableVehicles } from "@/hooks/use-vehicles";
import { getApiErrorMessage } from "@/lib/api";
import { vehicleDamagesService } from "@/services/vehicle-damages/service";
import { vehicleFuelingsService } from "@/services/vehicle-fuelings/service";
import { vehicleLoansService } from "@/services/vehicle-loans/service";
import type { CreateVehicleDamageDTO } from "@/types/vehicle-damage.type";
import {
  vehicleDamageDetectionMomentOptions,
  vehicleDamageSeverityOptions,
  vehicleDamageTypeOptions,
} from "@/types/vehicle-damage.type";
import type { CreateVehicleFuelingDTO } from "@/types/vehicle-fueling.type";
import { vehicleFuelTypeOptions } from "@/types/vehicle-fueling.type";
import { getVehicleLoanBorrowerLabel, type VehicleLoanItem } from "@/types/vehicle-loan.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const damageDraftSchema = z.object({
  damage_type: z.string().min(1, "Selecione o tipo do problema."),
  location: z
    .string()
    .trim()
    .min(3, "Informe o local do problema.")
    .max(100, "O local deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .min(5, "Descreva o problema com mais detalhes.")
    .max(1000, "A descrição deve ter no máximo 1000 caracteres."),
  severity: z.string().min(1, "Selecione a gravidade."),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
  photos_text: z.string().max(3000, "As URLs das fotos devem ter no máximo 3000 caracteres."),
});

const takeVehicleSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione uma viatura."),
  city_id: z.string(),
  start_km: z.coerce.number().int().min(0, "Informe um KM inicial válido."),
  start_notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
  damages: z.array(damageDraftSchema),
});

const returnVehicleSchema = z.object({
  end_km: z.coerce.number().int().min(0, "Informe um KM final válido."),
  return_notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
  damages: z.array(damageDraftSchema),
});

const fuelingSchema = z.object({
  fueling_date: z.string().min(1, "Informe a data do abastecimento."),
  fueling_time: z.string(),
  km: z.coerce.number().int().min(0, "Informe um KM válido."),
  fuel_type: z.string().min(1, "Selecione o combustível."),
  liters: z.coerce.number().min(0.01, "Informe a quantidade de litros."),
  price_per_liter: z.union([z.coerce.number().min(0), z.literal("")]),
  total_cost: z.union([z.coerce.number().min(0), z.literal("")]),
  gas_station: z.string().max(100, "O posto deve ter no máximo 100 caracteres."),
  gas_station_city: z.string().max(100, "A cidade deve ter no máximo 100 caracteres."),
  is_full_tank: z.boolean(),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
});

const quickDamageSchema = z.object({
  detection_moment: z.string().min(1, "Selecione o momento da ocorrência."),
  damage_type: z.string().min(1, "Selecione o tipo do problema."),
  location: z
    .string()
    .trim()
    .min(3, "Informe o local do problema.")
    .max(100, "O local deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .min(5, "Descreva o problema com mais detalhes.")
    .max(1000, "A descrição deve ter no máximo 1000 caracteres."),
  severity: z.string().min(1, "Selecione a gravidade."),
  notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
  photos_text: z.string().max(3000, "As URLs das fotos devem ter no máximo 3000 caracteres."),
});

type DamageDraftValues = z.output<typeof damageDraftSchema>;
type TakeVehicleValues = z.output<typeof takeVehicleSchema>;
type ReturnVehicleValues = z.output<typeof returnVehicleSchema>;
type FuelingValues = z.output<typeof fuelingSchema>;
type QuickDamageValues = z.output<typeof quickDamageSchema>;

const emptyDamageDraft: DamageDraftValues = {
  damage_type: "other",
  location: "",
  description: "",
  severity: "minor",
  notes: "",
  photos_text: "",
};

function toDateInput(value = new Date()) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

function toTimeInput(value = new Date()) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(11, 16);
}

function parsePhotoLines(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeTime(value: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

function parseNumberField(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : Number(value);
}

function formatPlateLabel(item?: {
  license_plate?: string | null;
  vehicle_type?: { name?: string | null } | null;
  variant?: { name?: string | null } | null;
} | null) {
  const details = [item?.vehicle_type?.name, item?.variant?.name]
    .filter(Boolean)
    .join(" • ");

  return [item?.license_plate ?? "Viatura", details].filter(Boolean).join(" • ");
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

async function invalidateOperationalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["vehicle-loans"] }),
    queryClient.invalidateQueries({ queryKey: ["vehicle-damages"] }),
    queryClient.invalidateQueries({ queryKey: ["vehicle-fuelings"] }),
    queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
    queryClient.invalidateQueries({ queryKey: ["vehicle-reports"] }),
    queryClient.invalidateQueries({ queryKey: ["vehicle-operations"] }),
    queryClient.invalidateQueries({ queryKey: ["home"] }),
  ]);
}

function StepBadge({
  step,
  currentStep,
  label,
}: {
  step: number;
  currentStep: number;
  label: string;
}) {
  const isActive = step === currentStep;
  const isDone = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
          isDone
            ? "bg-emerald-100 text-emerald-700"
            : isActive
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {isDone ? "✓" : step}
      </div>
      <span className={isActive ? "text-sm font-medium text-slate-900" : "text-sm text-slate-500"}>
        {label}
      </span>
    </div>
  );
}

function DamageDraftList<T extends FieldValues & { damages: DamageDraftValues[] }>({
  control,
  register,
  setValue,
  errors,
  title,
  description,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  title: string;
  description: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "damages" as FieldArrayPath<T>,
  });
  const damages = useWatch({ control, name: "damages" as Path<T> }) as DamageDraftValues[];
  const damageErrors = errors.damages as
    | Array<Partial<Record<keyof DamageDraftValues, { message?: string }>>>
    | undefined;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ ...emptyDamageDraft } as unknown as FieldArray<T, FieldArrayPath<T>>)
          }
        >
          Adicionar problema
        </Button>
      </div>

      {!fields.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Nenhum problema informado nesta etapa.
        </div>
      ) : null}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const previewPhotos = parsePhotoLines(damages?.[index]?.photos_text).slice(
            0,
            3,
          );

          return (
            <div
              key={field.id}
              className="space-y-4 rounded-[24px] border border-slate-200/70 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Problema #{index + 1}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Registro operacional
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-500"
                  onClick={() => remove(index)}
                >
                  Remover
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={damages?.[index]?.damage_type ?? "other"}
                    onValueChange={(value) =>
                      setValue(`damages.${index}.damage_type` as Path<T>, value as never, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleDamageTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-destructive">
                    {damageErrors?.[index]?.damage_type?.message ?? ""}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Gravidade</Label>
                  <Select
                    value={damages?.[index]?.severity ?? "minor"}
                    onValueChange={(value) =>
                      setValue(`damages.${index}.severity` as Path<T>, value as never, {
                        shouldDirty: true,
                        shouldValidate: true,
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
                  <p className="text-sm text-destructive">
                    {damageErrors?.[index]?.severity?.message ?? ""}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Local</Label>
                <Input {...register(`damages.${index}.location` as Path<T>)} placeholder="Ex.: para-choque dianteiro" />
                <p className="text-sm text-destructive">
                  {damageErrors?.[index]?.location?.message ?? ""}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Descricao</Label>
                <Textarea
                  {...register(`damages.${index}.description` as Path<T>)}
                  rows={3}
                  placeholder="Descreva o que foi encontrado."
                />
                <p className="text-sm text-destructive">
                  {damageErrors?.[index]?.description?.message ?? ""}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Observacoes</Label>
                <Textarea
                  {...register(`damages.${index}.notes` as Path<T>)}
                  rows={2}
                  placeholder="Informacoes complementares, se houver."
                />
              </div>

              <div className="space-y-2">
                <Label>URLs das fotos</Label>
                <Textarea
                  {...register(`damages.${index}.photos_text` as Path<T>)}
                  rows={3}
                  placeholder="Uma URL por linha para gerar preview."
                />
                {previewPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {previewPhotos.map((photo, photoIndex) => (
                      <div
                        key={`${photo}-${photoIndex}`}
                        className="h-20 rounded-2xl border border-slate-200 bg-cover bg-center"
                        style={{ backgroundImage: `url(${photo})` }}
                        aria-label={`Preview da foto ${photoIndex + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MyVehicleCard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loanPermissions = usePermissions("vehicle-loans");
  const damagePermissions = usePermissions("vehicle-damages");
  const fuelingPermissions = usePermissions("vehicle-fuelings");
  const canSeeCard =
    loanPermissions.canCreate ||
    loanPermissions.canUpdate ||
    damagePermissions.canCreate ||
    fuelingPermissions.canCreate;
  const activeLoanQuery = useMyActiveVehicleLoan(canSeeCard);
  const activeLoan = activeLoanQuery.data;
  const [isTakeDialogOpen, setIsTakeDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isFuelingDialogOpen, setIsFuelingDialogOpen] = useState(false);
  const [isDamageDialogOpen, setIsDamageDialogOpen] = useState(false);

  const takeVehicleMutation = useMutation({
    mutationFn: async (values: TakeVehicleValues) => {
      if (!user) {
        throw new Error("Sessão inválida. Entre novamente para continuar.");
      }

      const loanResponse = await vehicleLoansService.create({
        vehicle_id: Number(values.vehicle_id),
        borrower_id: user.id,
        borrower_type: getAuthenticatedBorrowerType(user),
        city_id: values.city_id && values.city_id !== "none" ? Number(values.city_id) : null,
        start_km: Number(values.start_km),
        start_notes: values.start_notes.trim() || null,
      });

      for (const damage of values.damages) {
        await vehicleDamagesService.create({
          vehicle_id: Number(values.vehicle_id),
          vehicle_loan_id: loanResponse.data.id,
          detection_moment: "pickup",
          damage_type: damage.damage_type as CreateVehicleDamageDTO["damage_type"],
          location: damage.location.trim(),
          description: damage.description.trim(),
          severity: damage.severity as CreateVehicleDamageDTO["severity"],
          notes: damage.notes.trim() || null,
          photos: parsePhotoLines(damage.photos_text),
        });
      }

      return loanResponse;
    },
    onSuccess: async (response) => {
      await invalidateOperationalQueries(queryClient);
      toast.success(
        response.data.vehicle?.license_plate
          ? `${response.data.vehicle.license_plate} assumida com sucesso.`
          : "Viatura assumida com sucesso.",
      );
      setIsTakeDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const returnVehicleMutation = useMutation({
    mutationFn: async (values: ReturnVehicleValues) => {
      if (!activeLoan) {
        throw new Error("Nenhum empréstimo ativo disponível para devolução.");
      }

      const response = await vehicleLoansService.markAsReturned(activeLoan.id, {
        end_km: Number(values.end_km),
        return_notes: values.return_notes.trim() || null,
        end_date: toDateInput(),
        end_time: normalizeTime(toTimeInput()),
      });

      for (const damage of values.damages) {
        await vehicleDamagesService.create({
          vehicle_id: activeLoan.vehicle_id,
          vehicle_loan_id: activeLoan.id,
          detection_moment: "return",
          damage_type: damage.damage_type as CreateVehicleDamageDTO["damage_type"],
          location: damage.location.trim(),
          description: damage.description.trim(),
          severity: damage.severity as CreateVehicleDamageDTO["severity"],
          notes: damage.notes.trim() || null,
          photos: parsePhotoLines(damage.photos_text),
        });
      }

      return response;
    },
    onSuccess: async () => {
      await invalidateOperationalQueries(queryClient);
      toast.success("Devolução registrada com sucesso.");
      setIsReturnDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const fuelingMutation = useMutation({
    mutationFn: async (values: FuelingValues) => {
      if (!activeLoan) {
        throw new Error("Nenhum empréstimo ativo disponível para abastecimento.");
      }

      return vehicleFuelingsService.create({
        vehicle_id: activeLoan.vehicle_id,
        vehicle_loan_id: activeLoan.id,
        fueling_date: values.fueling_date,
        fueling_time: normalizeTime(values.fueling_time),
        km: Number(values.km),
        fuel_type: values.fuel_type as CreateVehicleFuelingDTO["fuel_type"],
        liters: Number(values.liters),
        price_per_liter: parseNumberField(values.price_per_liter),
        total_cost: parseNumberField(values.total_cost),
        gas_station: values.gas_station.trim() || null,
        gas_station_city: values.gas_station_city.trim() || null,
        is_full_tank: values.is_full_tank,
        notes: values.notes.trim() || null,
      });
    },
    onSuccess: async () => {
      await invalidateOperationalQueries(queryClient);
      toast.success("Abastecimento registrado com sucesso.");
      setIsFuelingDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const damageMutation = useMutation({
    mutationFn: async (values: QuickDamageValues) => {
      if (!activeLoan) {
        throw new Error("Nenhum empréstimo ativo disponível para registrar problema.");
      }

      return vehicleDamagesService.create({
        vehicle_id: activeLoan.vehicle_id,
        vehicle_loan_id: activeLoan.id,
        detection_moment:
          values.detection_moment as CreateVehicleDamageDTO["detection_moment"],
        damage_type: values.damage_type as CreateVehicleDamageDTO["damage_type"],
        location: values.location.trim(),
        description: values.description.trim(),
        severity: values.severity as CreateVehicleDamageDTO["severity"],
        notes: values.notes.trim() || null,
        photos: parsePhotoLines(values.photos_text),
      });
    },
    onSuccess: async () => {
      await invalidateOperationalQueries(queryClient);
      toast.success("Problema registrado com sucesso.");
      setIsDamageDialogOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  if (!canSeeCard) {
    return null;
  }

  return (
    <>
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3 text-primary">
                <CarFront className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Minha viatura</CardTitle>
                <CardDescription>
                  Fluxo operacional rápido para retirada, devolução, danos e abastecimento.
                </CardDescription>
              </div>
            </div>
            <Badge variant={activeLoan ? "info" : "outline"}>
              {activeLoan ? "Emprestimo ativo" : "Sem viatura em uso"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {activeLoanQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 rounded-[24px]" />
              <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            </div>
          ) : activeLoanQuery.isError ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              Nao foi possível confirmar seu empréstimo ativo nesta subunidade. Verifique as permissões do módulo de empréstimos de veículos.
            </div>
          ) : activeLoan ? (
            <>
              <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Viatura atual
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                        {activeLoan.vehicle?.license_plate ?? `#${activeLoan.vehicle_id}`}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatPlateLabel(activeLoan.vehicle)}
                      </p>
                    </div>
                    <Badge variant="outline">{activeLoan.status_label ?? "Em uso"}</Badge>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Saida</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {formatDateLabel(
                          activeLoan.start_time
                            ? `${activeLoan.start_date}T${activeLoan.start_time}`
                            : activeLoan.start_date,
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">KM inicial</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {new Intl.NumberFormat("pt-BR").format(activeLoan.start_km)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Destino base</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {activeLoan.city?.name ?? "Nao informado"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-[24px] border border-slate-200/70 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Gauge className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">
                      {getVehicleLoanBorrowerLabel(activeLoan)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-sm">
                      {activeLoan.subunit?.abbreviation ?? activeLoan.subunit?.name ?? "Subunidade ativa"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-primary" />
                    <p className="text-sm">
                      {activeLoan.start_notes?.trim()
                        ? activeLoan.start_notes
                        : "Sem observacoes registradas na retirada."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  onClick={() => setIsReturnDialogOpen(true)}
                  disabled={!loanPermissions.canUpdate}
                >
                  Devolver viatura
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFuelingDialogOpen(true)}
                  disabled={!fuelingPermissions.canCreate}
                >
                  Informar abastecimento
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDamageDialogOpen(true)}
                  disabled={!damagePermissions.canCreate}
                >
                  Registrar problema
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      Nenhuma viatura em uso neste momento
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Quando você assumir uma viatura, este painel passa a mostrar o resumo do empréstimo e as ações rápidas da operação.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Button
                  onClick={() => setIsTakeDialogOpen(true)}
                  disabled={!loanPermissions.canCreate}
                >
                  Assumir viatura
                </Button>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-500 md:col-span-2">
                  O fluxo operacional preenche o empréstimo com sua sessão atual e mantém o CRUD administrativo intacto.
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <TakeVehicleDialog
        open={isTakeDialogOpen}
        onOpenChange={setIsTakeDialogOpen}
        isPending={takeVehicleMutation.isPending}
        onSubmit={(values) => takeVehicleMutation.mutateAsync(values)}
      />

      <ReturnVehicleDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        activeLoan={activeLoan ?? null}
        isPending={returnVehicleMutation.isPending}
        onSubmit={(values) => returnVehicleMutation.mutateAsync(values)}
      />

      <FuelingDialog
        open={isFuelingDialogOpen}
        onOpenChange={setIsFuelingDialogOpen}
        activeLoan={activeLoan ?? null}
        isPending={fuelingMutation.isPending}
        onSubmit={(values) => fuelingMutation.mutateAsync(values)}
      />

      <QuickDamageDialog
        open={isDamageDialogOpen}
        onOpenChange={setIsDamageDialogOpen}
        isPending={damageMutation.isPending}
        onSubmit={(values) => damageMutation.mutateAsync(values)}
      />
    </>
  );
}

function TakeVehicleDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: TakeVehicleValues) => Promise<unknown>;
}) {
  const vehiclesQuery = useAvailableVehicles({ per_page: 100 });
  const citiesQuery = useCities({ per_page: 100 });
  const damagePermissions = usePermissions("vehicle-damages");
  const [step, setStep] = useState(1);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TakeVehicleValues>({
    resolver: zodResolver(takeVehicleSchema) as Resolver<TakeVehicleValues>,
    defaultValues: {
      vehicle_id: "",
      city_id: "none",
      start_km: 0,
      start_notes: "",
      damages: [],
    },
  });
  const values = useWatch({ control }) as TakeVehicleValues;
  const selectedVehicle = useMemo(
    () =>
      vehiclesQuery.data?.data.find(
        (vehicle) => String(vehicle.id) === values.vehicle_id,
      ) ?? null,
    [values.vehicle_id, vehiclesQuery.data?.data],
  );
  const selectedCity = useMemo(
    () =>
      citiesQuery.data?.data.find((city) => String(city.id) === values.city_id) ?? null,
    [citiesQuery.data?.data, values.city_id],
  );

  async function submit(values: TakeVehicleValues) {
    await onSubmit(values);
    reset();
    setStep(1);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
          setStep(1);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assumir viatura</DialogTitle>
          <DialogDescription>
            Retirada guiada para registrar viatura, KM inicial e avarias de saída.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
          <StepBadge step={1} currentStep={step} label="Dados iniciais" />
          <StepBadge step={2} currentStep={step} label="Problemas" />
          <StepBadge step={3} currentStep={step} label="Confirmacao" />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          {step === 1 ? (
            <section className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Viatura</Label>
                <Select
                  value={values.vehicle_id || "none"}
                  onValueChange={(value) =>
                    setValue("vehicle_id", value === "none" ? "" : value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a viatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione a viatura</SelectItem>
                    {(vehiclesQuery.data?.data ?? []).map((vehicle) => (
                      <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                        {formatPlateLabel(vehicle)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-destructive">{errors.vehicle_id?.message}</p>
              </div>

              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select
                  value={values.city_id || "none"}
                  onValueChange={(value) =>
                    setValue("city_id", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nao informar</SelectItem>
                    {(citiesQuery.data?.data ?? []).map((city) => (
                      <SelectItem key={city.id} value={String(city.id)}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>KM inicial</Label>
                <Input type="number" min={0} {...register("start_km")} />
                <p className="text-sm text-destructive">{errors.start_km?.message}</p>
              </div>

              <div className="space-y-2">
                <Label>Resumo da viatura</Label>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {selectedVehicle
                    ? `${formatPlateLabel(selectedVehicle)} • KM atual ${new Intl.NumberFormat("pt-BR").format(selectedVehicle.current_km)}`
                    : "Selecione uma viatura para ver o resumo."}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Observacoes de retirada</Label>
                <Textarea
                  {...register("start_notes")}
                  rows={4}
                  placeholder="Checklist rápido, condição geral e observações da saída."
                />
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            damagePermissions.canCreate ? (
              <DamageDraftList
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                title="Avarias de retirada"
                description="Registre os problemas encontrados antes da saída da viatura."
              />
            ) : (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                Seu perfil nao possui permissão para criar danos. A retirada pode continuar sem essa etapa.
              </div>
            )
          ) : null}

          {step === 3 ? (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Viatura</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedVehicle ? formatPlateLabel(selectedVehicle) : "Nao selecionada"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cidade: {selectedCity?.name ?? "Nao informada"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Saida</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    KM inicial {new Intl.NumberFormat("pt-BR").format(values.start_km ?? 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {values.start_notes?.trim() || "Sem observacoes de retirada."}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Problemas registrados
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {values.damages.length} {values.damages.length === 1 ? "problema" : "problemas"}
                </p>
              </div>
            </section>
          ) : null}

          <DialogFooter>
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
                Voltar
              </Button>
            ) : null}

            {step < 3 ? (
              <Button type="button" onClick={() => setStep((current) => current + 1)}>
                Avancar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                Confirmar retirada
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReturnVehicleDialog({
  open,
  onOpenChange,
  activeLoan,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeLoan: VehicleLoanItem | null;
  isPending: boolean;
  onSubmit: (values: ReturnVehicleValues) => Promise<unknown>;
}) {
  const damagePermissions = usePermissions("vehicle-damages");
  const [step, setStep] = useState(1);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReturnVehicleValues>({
    resolver: zodResolver(
      returnVehicleSchema.superRefine((values, context) => {
        if (
          activeLoan &&
          Number.isFinite(values.end_km) &&
          values.end_km < activeLoan.start_km
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["end_km"],
            message: "O KM final nao pode ser menor que o KM inicial da retirada.",
          });
        }
      }),
    ) as Resolver<ReturnVehicleValues>,
    defaultValues: {
      end_km: activeLoan?.start_km ?? 0,
      return_notes: "",
      damages: [],
    },
  });
  const values = useWatch({ control }) as ReturnVehicleValues;

  async function submit(values: ReturnVehicleValues) {
    await onSubmit(values);
    reset();
    setStep(1);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset({
            end_km: activeLoan?.start_km ?? 0,
            return_notes: "",
            damages: [],
          });
          setStep(1);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devolver viatura</DialogTitle>
          <DialogDescription>
            Fechamento rápido do empréstimo com KM final e problemas encontrados no retorno.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
          <StepBadge step={1} currentStep={step} label="Devolucao" />
          <StepBadge step={2} currentStep={step} label="Avarias" />
          <StepBadge step={3} currentStep={step} label="Confirmacao" />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          {step === 1 ? (
            <section className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Viatura ativa</Label>
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  {activeLoan
                    ? `${formatPlateLabel(activeLoan.vehicle)} • KM inicial ${new Intl.NumberFormat("pt-BR").format(activeLoan.start_km)}`
                    : "Nenhuma viatura ativa encontrada."}
                </div>
              </div>

              <div className="space-y-2">
                <Label>KM final</Label>
                <Input type="number" min={0} {...register("end_km")} />
                <p className="text-sm text-destructive">{errors.end_km?.message}</p>
              </div>

              <div className="space-y-2">
                <Label>KM rodado estimado</Label>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {activeLoan
                    ? `${new Intl.NumberFormat("pt-BR").format(
                        Math.max(0, Number(values.end_km ?? 0) - activeLoan.start_km),
                      )} km`
                    : "-"}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Observacoes da devolucao</Label>
                <Textarea
                  {...register("return_notes")}
                  rows={4}
                  placeholder="Situação final da viatura, pendências ou observações da devolução."
                />
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            damagePermissions.canCreate ? (
              <DamageDraftList
                control={control}
                register={register}
                setValue={setValue}
                errors={errors}
                title="Avarias de devolucao"
                description="Registre novos problemas percebidos no retorno da viatura."
              />
            ) : (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                Seu perfil nao possui permissão para criar danos. A devolução pode continuar sem essa etapa.
              </div>
            )
          ) : null}

          {step === 3 ? (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Encerramento</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    KM final {new Intl.NumberFormat("pt-BR").format(values.end_km ?? 0)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {values.return_notes?.trim() || "Sem observacoes de devolucao."}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Problemas</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {values.damages.length} {values.damages.length === 1 ? "registro" : "registros"}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <DialogFooter>
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
                Voltar
              </Button>
            ) : null}

            {step < 3 ? (
              <Button type="button" onClick={() => setStep((current) => current + 1)}>
                Avancar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isPending || !activeLoan}>
                Confirmar devolucao
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FuelingDialog({
  open,
  onOpenChange,
  activeLoan,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeLoan: VehicleLoanItem | null;
  isPending: boolean;
  onSubmit: (values: FuelingValues) => Promise<unknown>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FuelingValues>({
    resolver: zodResolver(fuelingSchema) as Resolver<FuelingValues>,
    defaultValues: {
      fueling_date: toDateInput(),
      fueling_time: toTimeInput(),
      km: activeLoan?.start_km ?? 0,
      fuel_type: "gasoline",
      liters: 0,
      price_per_liter: "",
      total_cost: "",
      gas_station: "",
      gas_station_city: "",
      is_full_tank: false,
      notes: "",
    },
  });
  const selectedFuelType = useWatch({ control, name: "fuel_type" });
  const liters = useWatch({ control, name: "liters" });
  const pricePerLiter = useWatch({ control, name: "price_per_liter" });
  const isFullTank = useWatch({ control, name: "is_full_tank" });

  const totalPreview = useMemo(() => {
    const numericLiters = Number(liters);
    const numericPrice = Number(pricePerLiter);

    if (!Number.isFinite(numericLiters) || !Number.isFinite(numericPrice)) {
      return null;
    }

    return Number((numericLiters * numericPrice).toFixed(2));
  }, [liters, pricePerLiter]);

  async function submit(values: FuelingValues) {
    await onSubmit(values);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset({
            fueling_date: toDateInput(),
            fueling_time: toTimeInput(),
            km: activeLoan?.start_km ?? 0,
            fuel_type: "gasoline",
            liters: 0,
            price_per_liter: "",
            total_cost: "",
            gas_station: "",
            gas_station_city: "",
            is_full_tank: false,
            notes: "",
          });
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Informar abastecimento</DialogTitle>
          <DialogDescription>
            Registro rápido do abastecimento vinculado ao empréstimo ativo da viatura.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="rounded-[24px] border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
            {activeLoan
              ? `${formatPlateLabel(activeLoan.vehicle)} • empréstimo #${activeLoan.id}`
              : "Nenhuma viatura ativa encontrada."}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" {...register("fueling_date")} />
              <p className="text-sm text-destructive">{errors.fueling_date?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" {...register("fueling_time")} />
            </div>

            <div className="space-y-2">
              <Label>KM</Label>
              <Input type="number" min={0} {...register("km")} />
              <p className="text-sm text-destructive">{errors.km?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Combustivel</Label>
              <Select
                value={selectedFuelType || "gasoline"}
                onValueChange={(value) =>
                  setValue("fuel_type", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o combustível" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleFuelTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-destructive">{errors.fuel_type?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Litros</Label>
              <Input type="number" min={0} step="0.01" {...register("liters")} />
              <p className="text-sm text-destructive">{errors.liters?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Preco por litro</Label>
              <Input type="number" min={0} step="0.01" {...register("price_per_liter")} />
            </div>

            <div className="space-y-2">
              <Label>Valor total</Label>
              <Input type="number" min={0} step="0.01" {...register("total_cost")} />
              {totalPreview !== null ? (
                <p className="text-xs text-slate-500">
                  Sugestao automática: R$ {totalPreview.toFixed(2)}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Posto</Label>
              <Input {...register("gas_station")} placeholder="Nome do posto" />
            </div>

            <div className="space-y-2">
              <Label>Cidade do posto</Label>
              <Input {...register("gas_station_city")} placeholder="Cidade do abastecimento" />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Checkbox
                checked={isFullTank}
                onCheckedChange={(checked) =>
                  setValue("is_full_tank", Boolean(checked), { shouldDirty: true })
                }
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Tanque cheio</p>
                <p className="text-xs text-slate-500">Marque se o abastecimento completou o tanque.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observacoes</Label>
            <Textarea {...register("notes")} rows={4} placeholder="Cupom, rota, consumo ou observações." />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || !activeLoan}>
              Registrar abastecimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuickDamageDialog({
  open,
  onOpenChange,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSubmit: (values: QuickDamageValues) => Promise<unknown>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<QuickDamageValues>({
    resolver: zodResolver(quickDamageSchema) as Resolver<QuickDamageValues>,
    defaultValues: {
      detection_moment: "inspection",
      damage_type: "other",
      location: "",
      description: "",
      severity: "minor",
      notes: "",
      photos_text: "",
    },
  });
  const selectedDetectionMoment = useWatch({ control, name: "detection_moment" });
  const selectedDamageType = useWatch({ control, name: "damage_type" });
  const selectedSeverity = useWatch({ control, name: "severity" });
  const photosText = useWatch({ control, name: "photos_text" });
  const previews = parsePhotoLines(photosText).slice(0, 3);

  async function submit(values: QuickDamageValues) {
    await onSubmit(values);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar problema</DialogTitle>
          <DialogDescription>
            Ação rápida para registrar dano ou irregularidade durante o uso da viatura.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Momento</Label>
              <Select
                value={selectedDetectionMoment || "inspection"}
                onValueChange={(value) =>
                  setValue("detection_moment", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o momento" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleDamageDetectionMomentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-destructive">{errors.detection_moment?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={selectedDamageType || "other"}
                onValueChange={(value) =>
                  setValue("damage_type", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleDamageTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-destructive">{errors.damage_type?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Gravidade</Label>
              <Select
                value={selectedSeverity || "minor"}
                onValueChange={(value) =>
                  setValue("severity", value, {
                    shouldDirty: true,
                    shouldValidate: true,
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
              <p className="text-sm text-destructive">{errors.severity?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Local</Label>
              <Input {...register("location")} placeholder="Ex.: porta traseira direita" />
              <p className="text-sm text-destructive">{errors.location?.message}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descricao</Label>
            <Textarea {...register("description")} rows={4} placeholder="Explique o que aconteceu e o que foi observado." />
            <p className="text-sm text-destructive">{errors.description?.message}</p>
          </div>

          <div className="space-y-2">
            <Label>Observacoes</Label>
            <Textarea {...register("notes")} rows={3} placeholder="Detalhes adicionais, testemunhas ou encaminhamentos." />
          </div>

          <div className="space-y-2">
            <Label>URLs das fotos</Label>
            <Textarea {...register("photos_text")} rows={3} placeholder="Uma URL por linha para preview." />
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {previews.map((photo, index) => (
                  <div
                    key={`${photo}-${index}`}
                    className="h-20 rounded-2xl border border-slate-200 bg-cover bg-center"
                    style={{ backgroundImage: `url(${photo})` }}
                    aria-label={`Preview da foto ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Registrar problema
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
