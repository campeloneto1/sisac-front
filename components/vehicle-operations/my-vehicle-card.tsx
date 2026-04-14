"use client";

import { useMemo, useRef, useState } from "react";
import {
  useForm,
  useWatch,
  type Resolver,
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
import type { CreateVehicleDamageWithFilesDTO } from "@/types/vehicle-damage.type";
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

const takeVehicleSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione uma viatura."),
  city_id: z.string(),
  start_km: z.number().int().min(0, "Informe um KM inicial válido."),
  start_notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
});

const returnVehicleSchema = z.object({
  end_km: z.number().int().min(0, "Informe um KM final válido."),
  return_notes: z.string().max(1000, "As observações devem ter no máximo 1000 caracteres."),
});

const fuelingSchema = z.object({
  fueling_date: z.string().min(1, "Informe a data do abastecimento."),
  fueling_time: z.string(),
  km: z.number().int().min(0, "Informe um KM válido."),
  fuel_type: z.string().min(1, "Selecione o combustível."),
  liters: z.number().min(0.01, "Informe a quantidade de litros."),
  price_per_liter: z.union([z.number().min(0), z.literal("")]),
  total_cost: z.union([z.number().min(0), z.literal("")]),
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
});

type TakeVehicleValues = z.output<typeof takeVehicleSchema>;
type ReturnVehicleValues = z.output<typeof returnVehicleSchema>;
type FuelingValues = z.output<typeof fuelingSchema>;
type QuickDamageValues = z.output<typeof quickDamageSchema>;

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
  special_plate?: string | null;
  vehicle_type?: { name?: string | null } | null;
  variant?: {
    name?: string | null;
    brand?: { name?: string | null } | null;
  } | null;
} | null) {
  // Combinar placa normal e placa especial
  const plates = [item?.license_plate, item?.special_plate]
    .filter(Boolean)
    .join(" / ");

  // Combinar marca, modelo e tipo de veículo
  const details = [
    item?.variant?.brand?.name,
    item?.variant?.name,
    item?.vehicle_type?.name,
  ]
    .filter(Boolean)
    .join(" • ");

  return [plates || "Viatura", details].filter(Boolean).join(" • ");
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return "Nao informado";
  }

  const normalizedValue =
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Nao informado";
  }

  const hasTime = /T\d{2}:\d{2}/.test(normalizedValue);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(hasTime ? { timeStyle: "short" as const } : {}),
  }).format(parsedDate);
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

      return vehicleLoansService.create({
        vehicle_id: Number(values.vehicle_id),
        borrower_id: user.id,
        borrower_type: getAuthenticatedBorrowerType(user),
        city_id: values.city_id && values.city_id !== "none" ? Number(values.city_id) : null,
        start_km: Number(values.start_km),
        start_notes: values.start_notes.trim() || null,
      });
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

      return vehicleLoansService.markAsReturned(activeLoan.id, {
        end_km: Number(values.end_km),
        return_notes: values.return_notes.trim() || null,
        end_date: toDateInput(),
        end_time: normalizeTime(toTimeInput()),
      });
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
    mutationFn: async (values: QuickDamageValues & { photo_file?: File }) => {
      if (!activeLoan) {
        throw new Error("Nenhum empréstimo ativo disponível para registrar problema.");
      }

      const payload: CreateVehicleDamageWithFilesDTO = {
        vehicle_id: activeLoan.vehicle_id,
        vehicle_loan_id: activeLoan.id,
        detection_moment:
          values.detection_moment as CreateVehicleDamageWithFilesDTO["detection_moment"],
        damage_type: values.damage_type as CreateVehicleDamageWithFilesDTO["damage_type"],
        location: values.location.trim(),
        description: values.description.trim(),
        severity: values.severity as CreateVehicleDamageWithFilesDTO["severity"],
        photo_files: values.photo_file ? [values.photo_file] : undefined,
      };

      return vehicleDamagesService.create(payload);
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
            Registre a viatura e o KM inicial. Apos confirmar, use &quot;Registrar problema&quot; para informar avarias.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
          <StepBadge step={1} currentStep={step} label="Dados iniciais" />
          <StepBadge step={2} currentStep={step} label="Confirmacao" />
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
                <Input type="number" min={0} {...register("start_km", { valueAsNumber: true })} />
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

              <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  Apos confirmar a retirada, use o botao &quot;Registrar problema&quot; para informar avarias encontradas na viatura com fotos.
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

            {step < 2 ? (
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
  const [step, setStep] = useState(1);
  const {
    control,
    register,
    handleSubmit,
    reset,
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
          });
          setStep(1);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devolver viatura</DialogTitle>
          <DialogDescription>
            Registre o KM final. Problemas encontrados no retorno podem ser informados antes via &quot;Registrar problema&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
          <StepBadge step={1} currentStep={step} label="Devolucao" />
          <StepBadge step={2} currentStep={step} label="Confirmacao" />
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
                <Input type="number" min={0} {...register("end_km", { valueAsNumber: true })} />
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
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">KM rodado</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {activeLoan
                      ? `${new Intl.NumberFormat("pt-BR").format(
                          Math.max(0, Number(values.end_km ?? 0) - activeLoan.start_km),
                        )} km`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  Problemas encontrados no retorno devem ser registrados antes de devolver, usando o botao &quot;Registrar problema&quot;.
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

            {step < 2 ? (
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
              <Input type="number" min={0} {...register("km", { valueAsNumber: true })} />
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
              <Input type="number" min={0} step="0.01" {...register("liters", { valueAsNumber: true })} />
              <p className="text-sm text-destructive">{errors.liters?.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Preco por litro</Label>
              <Input type="number" min={0} step="0.01" {...register("price_per_liter", { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Valor total</Label>
              <Input type="number" min={0} step="0.01" {...register("total_cost", { valueAsNumber: true })} />
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
  onSubmit: (values: QuickDamageValues & { photo_file?: File }) => Promise<unknown>;
}) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      detection_moment: "pickup",
      damage_type: "other",
      location: "",
      description: "",
      severity: "minor",
    },
  });
  const selectedDetectionMoment = useWatch({ control, name: "detection_moment" });
  const selectedDamageType = useWatch({ control, name: "damage_type" });
  const selectedSeverity = useWatch({ control, name: "severity" });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  }

  function clearPhoto() {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  }

  function resetForm() {
    reset();
    clearPhoto();
  }

  async function submit(values: QuickDamageValues) {
    await onSubmit({ ...values, photo_file: photoFile ?? undefined });
    resetForm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar problema</DialogTitle>
          <DialogDescription>
            Tire uma foto e descreva o problema encontrado na viatura.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
          {/* Foto - seção principal para mobile */}
          <div className="space-y-3">
            <Label>Foto do problema</Label>
            {photoPreview ? (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Preview da foto"
                  className="aspect-video w-full rounded-2xl border border-slate-200 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={clearPhoto}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-primary hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Tirar foto ou selecionar</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Campos simplificados */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Momento</Label>
              <Select
                value={selectedDetectionMoment || "pickup"}
                onValueChange={(value) =>
                  setValue("detection_moment", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleDamageDetectionMomentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleDamageTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectValue placeholder="Selecione" />
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

            <div className="space-y-2">
              <Label>Local</Label>
              <Input {...register("location")} placeholder="Ex.: porta traseira" />
              <p className="text-sm text-destructive">{errors.location?.message}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descricao do problema</Label>
            <Textarea
              {...register("description")}
              rows={3}
              placeholder="Descreva o que foi encontrado..."
            />
            <p className="text-sm text-destructive">{errors.description?.message}</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Registrar problema"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
