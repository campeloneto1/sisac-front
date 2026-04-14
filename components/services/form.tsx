"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useSubunit } from "@/contexts/subunit-context";
import { useCompanies } from "@/hooks/use-companies";
import { useContracts } from "@/hooks/use-contracts";
import { useSectors } from "@/hooks/use-sectors";
import { useCreateServiceMutation, useUpdateServiceMutation } from "@/hooks/use-service-mutations";
import { useServiceTypes } from "@/hooks/use-service-types";
import { useUsers } from "@/hooks/use-users";
import type {
  CreateServiceDTO,
  ServiceItem,
  ServicePriority,
  ServiceStatus,
  UpdateServiceDTO,
} from "@/types/service.type";
import { servicePriorityOptions, serviceStatusOptions } from "@/types/service.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

const serviceCreateSchema = z.object({
  company_id: z.string().min(1, "Selecione a empresa."),
  service_type_id: z.string().min(1, "Selecione o tipo de serviço."),
  contract_id: z.string(),
  requested_by: z.string().min(1, "Selecione o solicitante."),
  request_description: z
    .string()
    .min(10, "A descrição deve ter ao menos 10 caracteres.")
    .max(5000, "A descrição deve ter no máximo 5000 caracteres."),
  sector_id: z.string(),
  location: z.string().max(255, "A localização deve ter no máximo 255 caracteres.").optional().or(z.literal("")),
  scheduled_date: z.string().optional().or(z.literal("")),
  priority: z.string(),
  estimated_cost: z.string().optional().or(z.literal("")),
});

const serviceEditSchema = serviceCreateSchema.extend({
  status: z.string(),
  started_at: z.string().optional().or(z.literal("")),
  finished_at: z.string().optional().or(z.literal("")),
  start_observations: z.string().max(2000, "As observações de início devem ter no máximo 2000 caracteres.").optional().or(z.literal("")),
  finish_observations: z.string().max(2000, "As observações de término devem ter no máximo 2000 caracteres.").optional().or(z.literal("")),
  cancellation_reason: z.string().max(2000, "O motivo de cancelamento deve ter no máximo 2000 caracteres.").optional().or(z.literal("")),
  actual_cost: z.string().optional().or(z.literal("")),
  rating: z.string().optional().or(z.literal("")),
  rating_comment: z.string().max(1000, "O comentario da avaliação deve ter no máximo 1000 caracteres.").optional().or(z.literal("")),
});

type ServiceCreateFormValues = z.infer<typeof serviceCreateSchema>;
type ServiceEditFormValues = z.infer<typeof serviceEditSchema>;

interface ServiceFormProps {
  mode: "create" | "edit";
  service?: ServiceItem;
}

function parseOptionalCurrency(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  return Number(value.replace(",", "."));
}

function parseOptionalInteger(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  return Number(value);
}

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();
  const { activeSubunit } = useSubunit();
  const createMutation = useCreateServiceMutation();
  const updateMutation = useUpdateServiceMutation();
  const isEnabled = Boolean(activeSubunit);

  const schema = mode === "create" ? serviceCreateSchema : serviceEditSchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ServiceCreateFormValues | ServiceEditFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: service?.company_id ? String(service.company_id) : "",
      service_type_id: service?.service_type_id ? String(service.service_type_id) : "",
      contract_id: service?.contract_id ? String(service.contract_id) : "none",
      requested_by: service?.requested_by ? String(service.requested_by) : "",
      request_description: service?.request_description ?? "",
      sector_id: service?.sector_id ? String(service.sector_id) : "none",
      location: service?.location ?? "",
      scheduled_date: formatDateTimeLocal(service?.scheduled_date),
      priority: service?.priority ?? "media",
      estimated_cost:
        service?.estimated_cost !== null && service?.estimated_cost !== undefined
          ? String(service.estimated_cost)
          : "",
      ...(mode === "edit"
        ? {
            status: service?.status ?? "solicitado",
            started_at: formatDateTimeLocal(service?.started_at),
            finished_at: formatDateTimeLocal(service?.finished_at),
            start_observations: service?.start_observations ?? "",
            finish_observations: service?.finish_observations ?? "",
            cancellation_reason: service?.cancellation_reason ?? "",
            actual_cost:
              service?.actual_cost !== null && service?.actual_cost !== undefined
                ? String(service.actual_cost)
                : "",
            rating: service?.rating ? String(service.rating) : "",
            rating_comment: service?.rating_comment ?? "",
          }
        : {}),
    },
  });

  const selectedCompanyId = useWatch({ control, name: "company_id" });
  const selectedServiceTypeId = useWatch({ control, name: "service_type_id" });
  const selectedContractId = useWatch({ control, name: "contract_id" });
  const selectedRequestedBy = useWatch({ control, name: "requested_by" });
  const selectedSectorId = useWatch({ control, name: "sector_id" });
  const selectedPriority = useWatch({ control, name: "priority" });
  const selectedStatus = useWatch({ control, name: "status" as never });
  const selectedCompanyNumber =
    selectedCompanyId && selectedCompanyId !== "none" ? Number(selectedCompanyId) : null;
  const companiesQuery = useCompanies({ per_page: 100 }, isEnabled);
  const serviceTypesQuery = useServiceTypes({ per_page: 100 });
  const contractsQuery = useContracts(
    {
      per_page: 100,
      company_id: selectedCompanyNumber ?? undefined,
    },
    isEnabled && Boolean(selectedCompanyNumber),
  );
  const usersQuery = useUsers({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 }, isEnabled);

  useEffect(() => {
    if (!service) {
      return;
    }

    reset({
      company_id: String(service.company_id),
      service_type_id: String(service.service_type_id),
      contract_id: service.contract_id ? String(service.contract_id) : "none",
      requested_by: String(service.requested_by),
      request_description: service.request_description ?? "",
      sector_id: service.sector_id ? String(service.sector_id) : "none",
      location: service.location ?? "",
      scheduled_date: formatDateTimeLocal(service.scheduled_date),
      priority: service.priority ?? "media",
      estimated_cost:
        service.estimated_cost !== null && service.estimated_cost !== undefined
          ? String(service.estimated_cost)
          : "",
      ...(mode === "edit"
        ? {
            status: service.status ?? "solicitado",
            started_at: formatDateTimeLocal(service.started_at),
            finished_at: formatDateTimeLocal(service.finished_at),
            start_observations: service.start_observations ?? "",
            finish_observations: service.finish_observations ?? "",
            cancellation_reason: service.cancellation_reason ?? "",
            actual_cost:
              service.actual_cost !== null && service.actual_cost !== undefined
                ? String(service.actual_cost)
                : "",
            rating: service.rating ? String(service.rating) : "",
            rating_comment: service.rating_comment ?? "",
          }
        : {}),
    });
  }, [mode, reset, service]);

  async function onSubmit(values: ServiceCreateFormValues | ServiceEditFormValues) {
    if (!activeSubunit) {
      return;
    }

    if (mode === "create") {
      const createValues = values as ServiceCreateFormValues;

      const payload: CreateServiceDTO = {
        company_id: Number(createValues.company_id),
        service_type_id: Number(createValues.service_type_id),
        contract_id:
          createValues.contract_id !== "none" ? Number(createValues.contract_id) : null,
        requested_by: Number(createValues.requested_by),
        request_description: createValues.request_description.trim(),
        sector_id:
          createValues.sector_id !== "none" ? Number(createValues.sector_id) : null,
        location: createValues.location?.trim() || null,
        scheduled_date: createValues.scheduled_date
          ? new Date(createValues.scheduled_date).toISOString()
          : null,
        priority: createValues.priority as ServicePriority,
        estimated_cost: parseOptionalCurrency(createValues.estimated_cost),
      };

      const response = await createMutation.mutateAsync(payload);
      router.push(`/services/${response.data.id}`);
      return;
    }

    if (!service) {
      return;
    }

    const editValues = values as ServiceEditFormValues;

    // Calcula started_at: usa o valor do form ou seta automaticamente se mudando para "em_andamento"
    let startedAt = editValues.started_at ? new Date(editValues.started_at).toISOString() : null;
    if (editValues.status === "em_andamento" && !editValues.started_at && !service.started_at) {
      startedAt = new Date().toISOString();
    }

    // Calcula finished_at: usa o valor do form ou seta automaticamente se mudando para "concluido"
    let finishedAt = editValues.finished_at ? new Date(editValues.finished_at).toISOString() : null;
    if (editValues.status === "concluido" && !editValues.finished_at && !service.finished_at) {
      finishedAt = new Date().toISOString();
    }

    const payload: UpdateServiceDTO = {
      company_id: Number(editValues.company_id),
      service_type_id: Number(editValues.service_type_id),
      contract_id: editValues.contract_id !== "none" ? Number(editValues.contract_id) : null,
      requested_by: Number(editValues.requested_by),
      request_description: editValues.request_description.trim(),
      sector_id: editValues.sector_id !== "none" ? Number(editValues.sector_id) : null,
      location: editValues.location?.trim() || null,
      scheduled_date: editValues.scheduled_date
        ? new Date(editValues.scheduled_date).toISOString()
        : null,
      status: editValues.status as ServiceStatus,
      priority: editValues.priority as ServicePriority,
      started_at: startedAt,
      finished_at: finishedAt,
      start_observations: editValues.start_observations?.trim() || null,
      finish_observations: editValues.finish_observations?.trim() || null,
      cancellation_reason: editValues.cancellation_reason?.trim() || null,
      estimated_cost: parseOptionalCurrency(editValues.estimated_cost),
      actual_cost: parseOptionalCurrency(editValues.actual_cost),
      rating: parseOptionalInteger(editValues.rating),
      rating_comment: editValues.rating_comment?.trim() || null,
    };

    const response = await updateMutation.mutateAsync({
      id: service.id,
      payload,
    });
    router.push(`/services/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Novo serviço" : "Editar serviço"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Registre a solicitação inicial do serviço. A data de solicitação e assumida pela API se não for enviada."
            : "Atualize os dados operacionais, custos e andamento da execução do serviço."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activeSubunit ? (
          <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Selecione uma subunidade ativa antes de cadastrar ou editar serviços.
          </div>
        ) : null}

        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={selectedCompanyId || "none"}
                onValueChange={(value) => {
                  setValue("company_id", value === "none" ? "" : value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("contract_id", "none", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione a empresa</SelectItem>
                  {(companiesQuery.data?.data ?? []).map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.trade_name || company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {"company_id" in errors && errors.company_id ? (
                <p className="text-sm text-destructive">{errors.company_id.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo de serviço</Label>
              <Select
                value={selectedServiceTypeId || "none"}
                onValueChange={(value) =>
                  setValue("service_type_id", value === "none" ? "" : value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o tipo</SelectItem>
                  {(serviceTypesQuery.data?.data ?? []).map((serviceType) => (
                    <SelectItem key={serviceType.id} value={String(serviceType.id)}>
                      {serviceType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {"service_type_id" in errors && errors.service_type_id ? (
                <p className="text-sm text-destructive">
                  {errors.service_type_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Contrato</Label>
              <Select
                value={selectedContractId || "none"}
                onValueChange={(value) =>
                  setValue("contract_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem contrato</SelectItem>
                  {(contractsQuery.data?.data ?? []).map((contract) => (
                    <SelectItem key={contract.id} value={String(contract.id)}>
                      {contract.contract_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Os contratos sao filtrados pela empresa selecionada dentro da
                subunidade ativa.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Solicitante</Label>
              <Select
                value={selectedRequestedBy || "none"}
                onValueChange={(value) =>
                  setValue("requested_by", value === "none" ? "" : value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o solicitante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione o solicitante</SelectItem>
                  {(usersQuery.data?.data ?? []).map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {"requested_by" in errors && errors.requested_by ? (
                <p className="text-sm text-destructive">{errors.requested_by.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Setor</Label>
              <Select
                value={selectedSectorId || "none"}
                onValueChange={(value) =>
                  setValue("sector_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem setor</SelectItem>
                  {(sectorsQuery.data?.data ?? []).map((sector) => (
                    <SelectItem key={sector.id} value={String(sector.id)}>
                      {sector.abbreviation ? `${sector.abbreviation} • ${sector.name}` : sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={selectedPriority || "media"}
                onValueChange={(value) =>
                  setValue("priority", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {servicePriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label>Localização</Label>
              <Input
                placeholder="Ex.: Almoxarifado central, Sala 12, Patio externo"
                {...register("location")}
              />
              {"location" in errors && errors.location ? (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Data agendada</Label>
              <Input type="datetime-local" {...register("scheduled_date")} />
            </div>

            <div className="space-y-2">
              <Label>Custo estimado</Label>
              <Input type="number" step="0.01" min={0} {...register("estimated_cost")} />
            </div>

            {mode === "edit" ? (
              <>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={(selectedStatus as string) || "solicitado"}
                    onValueChange={(value) =>
                      setValue("status" as never, value as never, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceStatusOptions
                        .filter((option) => option.value !== service?.status)
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Status atual: {service?.status_label || service?.status}
                  </p>
                  {(selectedStatus as string) === "em_andamento" && !service?.started_at ? (
                    <p className="text-xs text-blue-600">
                      A data de início será setada automaticamente
                    </p>
                  ) : null}
                  {(selectedStatus as string) === "concluido" && !service?.finished_at ? (
                    <p className="text-xs text-blue-600">
                      A data de término será setada automaticamente
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="datetime-local" {...register("started_at" as never)} />
                </div>

                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input type="datetime-local" {...register("finished_at" as never)} />
                </div>

                <div className="space-y-2">
                  <Label>Custo real</Label>
                  <Input type="number" step="0.01" min={0} {...register("actual_cost" as never)} />
                </div>

                <div className="space-y-2">
                  <Label>Avaliação</Label>
                  <Input type="number" min={1} max={5} {...register("rating" as never)} />
                </div>
              </>
            ) : null}
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <Label>Descrição da solicitação</Label>
              <Textarea
                rows={5}
                placeholder="Descreva a necessidade, o contexto e os detalhes do serviço solicitado."
                {...register("request_description")}
              />
              {"request_description" in errors && errors.request_description ? (
                <p className="text-sm text-destructive">
                  {errors.request_description.message}
                </p>
              ) : null}
            </div>

            {mode === "edit" ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Observações de início</Label>
                    <Textarea rows={4} {...register("start_observations" as never)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Observações de término</Label>
                    <Textarea rows={4} {...register("finish_observations" as never)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Motivo de cancelamento</Label>
                    <Textarea rows={4} {...register("cancellation_reason" as never)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Comentario da avaliação</Label>
                    <Textarea rows={4} {...register("rating_comment" as never)} />
                  </div>
                </div>
              </>
            ) : null}
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/services" : `/services/${service?.id}`}>
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending || !activeSubunit}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar serviço"
                  : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
