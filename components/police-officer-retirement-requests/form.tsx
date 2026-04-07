"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useCreatePoliceOfficerRetirementRequestMutation,
  useUpdatePoliceOfficerRetirementRequestMutation,
} from "@/hooks/use-police-officer-retirement-request-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import type {
  CreatePoliceOfficerRetirementRequestDTO,
  PoliceOfficerRetirementRequestItem,
  UpdatePoliceOfficerRetirementRequestDTO,
} from "@/types/police-officer-retirement-request.type";
import { RETIREMENT_REQUEST_STATUS_OPTIONS } from "@/types/police-officer-retirement-request.type";
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

const policeOfficerRetirementRequestFormSchema = z
  .object({
    police_officer_id: z
      .string()
      .refine((value) => value !== "none", "Selecione o policial."),
    nup: z
      .string()
      .max(50, "O NUP deve ter no maximo 50 caracteres.")
      .optional(),
    bulletin_request: z
      .string()
      .max(100, "O boletim de requerimento deve ter no maximo 100 caracteres.")
      .optional(),
    bulletin_publication: z
      .string()
      .max(100, "O boletim de publicacao deve ter no maximo 100 caracteres.")
      .optional(),
    requested_at: z.string().min(1, "Informe a data do requerimento."),
    approved_at: z.string().optional(),
    published_at: z.string().optional(),
    status: z.string(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.approved_at && data.requested_at) {
        return new Date(data.approved_at) >= new Date(data.requested_at);
      }
      return true;
    },
    {
      message: "A data de aprovacao deve ser igual ou posterior ao requerimento.",
      path: ["approved_at"],
    },
  )
  .refine(
    (data) => {
      if (data.published_at && data.requested_at) {
        return new Date(data.published_at) >= new Date(data.approved_at || data.requested_at);
      }
      return true;
    },
    {
      message:
        "A data de publicacao deve ser igual ou posterior a ultima etapa valida do processo.",
      path: ["published_at"],
    },
  )
  .refine(
    (data) => {
      if (["approved", "published"].includes(data.status)) {
        return Boolean(data.approved_at);
      }
      return true;
    },
    {
      message:
        "A data de aprovacao e obrigatoria para processos deferidos ou publicados.",
      path: ["approved_at"],
    },
  )
  .refine(
    (data) => {
      if (data.status === "published") {
        return Boolean(data.published_at);
      }
      return true;
    },
    {
      message: "A data de publicacao e obrigatoria quando o processo estiver publicado.",
      path: ["published_at"],
    },
  )
  .refine(
    (data) => {
      if (data.status === "published") {
        return Boolean(data.bulletin_publication?.trim());
      }
      return true;
    },
    {
      message:
        "O boletim de publicacao e obrigatorio quando o processo estiver publicado.",
      path: ["bulletin_publication"],
    },
  );

type PoliceOfficerRetirementRequestFormValues = z.infer<
  typeof policeOfficerRetirementRequestFormSchema
>;

interface PoliceOfficerRetirementRequestFormProps {
  mode: "create" | "edit";
  policeOfficerRetirementRequest?: PoliceOfficerRetirementRequestItem;
}

export function PoliceOfficerRetirementRequestForm({
  mode,
  policeOfficerRetirementRequest,
}: PoliceOfficerRetirementRequestFormProps) {
  const router = useRouter();
  const createMutation = useCreatePoliceOfficerRetirementRequestMutation();
  const updateMutation = useUpdatePoliceOfficerRetirementRequestMutation();
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PoliceOfficerRetirementRequestFormValues>({
    resolver: zodResolver(policeOfficerRetirementRequestFormSchema),
    defaultValues: {
      police_officer_id: policeOfficerRetirementRequest?.police_officer_id
        ? String(policeOfficerRetirementRequest.police_officer_id)
        : "none",
      nup: policeOfficerRetirementRequest?.nup ?? "",
      bulletin_request: policeOfficerRetirementRequest?.bulletin_request ?? "",
      bulletin_publication:
        policeOfficerRetirementRequest?.bulletin_publication ?? "",
      requested_at: policeOfficerRetirementRequest?.requested_at ?? "",
      approved_at: policeOfficerRetirementRequest?.approved_at ?? "",
      published_at: policeOfficerRetirementRequest?.published_at ?? "",
      status: policeOfficerRetirementRequest?.status ?? "requested",
      notes: policeOfficerRetirementRequest?.notes ?? "",
    },
  });

  const selectedPoliceOfficerId = useWatch({
    control,
    name: "police_officer_id",
  });
  const selectedStatus = useWatch({
    control,
    name: "status",
  });
  const requiresApprovalDate =
    selectedStatus === "approved" || selectedStatus === "published";
  const requiresPublicationData = selectedStatus === "published";

  useEffect(() => {
    if (!policeOfficerRetirementRequest) {
      return;
    }

    reset({
      police_officer_id: String(policeOfficerRetirementRequest.police_officer_id),
      nup: policeOfficerRetirementRequest.nup ?? "",
      bulletin_request: policeOfficerRetirementRequest.bulletin_request ?? "",
      bulletin_publication:
        policeOfficerRetirementRequest.bulletin_publication ?? "",
      requested_at: policeOfficerRetirementRequest.requested_at ?? "",
      approved_at: policeOfficerRetirementRequest.approved_at ?? "",
      published_at: policeOfficerRetirementRequest.published_at ?? "",
      status: policeOfficerRetirementRequest.status ?? "requested",
      notes: policeOfficerRetirementRequest.notes ?? "",
    });
  }, [policeOfficerRetirementRequest, reset]);

  async function onSubmit(values: PoliceOfficerRetirementRequestFormValues) {
    const payloadBase = {
      police_officer_id: Number(values.police_officer_id),
      nup: values.nup?.trim() || null,
      bulletin_request: values.bulletin_request?.trim() || null,
      bulletin_publication: values.bulletin_publication?.trim() || null,
      requested_at: values.requested_at,
      approved_at: values.approved_at || null,
      published_at: values.published_at || null,
      status: values.status as CreatePoliceOfficerRetirementRequestDTO["status"],
      notes: values.notes?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(
        payloadBase satisfies CreatePoliceOfficerRetirementRequestDTO,
      );
      router.push(`/police-officer-retirement-requests/${response.data.id}`);
      return;
    }

    if (!policeOfficerRetirementRequest) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: policeOfficerRetirementRequest.id,
      payload: payloadBase satisfies UpdatePoliceOfficerRetirementRequestDTO,
    });
    router.push(`/police-officer-retirement-requests/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>
          {mode === "create"
            ? "Novo requerimento de aposentadoria"
            : "Editar requerimento de aposentadoria"}
        </CardTitle>
        <CardDescription>
          Registro de solicitacao de aposentadoria do policial, com NUP, boletins
          e datas relevantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Dados principais
              </h3>
              <p className="text-sm text-slate-500">
                Selecione o policial e informe os dados do requerimento.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Policial</Label>
                <Select
                  value={selectedPoliceOfficerId}
                  onValueChange={(value) =>
                    setValue("police_officer_id", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {(policeOfficersQuery.data?.data ?? []).map((officer) => (
                      <SelectItem key={officer.id} value={String(officer.id)}>
                        {officer.name ??
                          officer.user?.name ??
                          officer.war_name ??
                          `Policial #${officer.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.police_officer_id ? (
                  <p className="text-sm text-destructive">
                    {errors.police_officer_id.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setValue("status", value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETIREMENT_REQUEST_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status ? (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nup">NUP</Label>
                <Input
                  id="nup"
                  placeholder="Ex.: 00000.000000/0000-00"
                  {...register("nup")}
                />
                {errors.nup ? (
                  <p className="text-sm text-destructive">{errors.nup.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requested_at">Data do requerimento</Label>
                <Input
                  id="requested_at"
                  type="date"
                  {...register("requested_at")}
                />
                {errors.requested_at ? (
                  <p className="text-sm text-destructive">
                    {errors.requested_at.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulletin_request">Boletim de requerimento</Label>
                <Input
                  id="bulletin_request"
                  placeholder="Ex.: BG 123/2024"
                  {...register("bulletin_request")}
                />
                {errors.bulletin_request ? (
                  <p className="text-sm text-destructive">
                    {errors.bulletin_request.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="approved_at">Data de aprovacao</Label>
                <Input
                  id="approved_at"
                  type="date"
                  aria-required={requiresApprovalDate}
                  {...register("approved_at")}
                />
                {requiresApprovalDate ? (
                  <p className="text-xs text-slate-500">
                    Obrigatoria para processos aprovados ou publicados.
                  </p>
                ) : null}
                {errors.approved_at ? (
                  <p className="text-sm text-destructive">
                    {errors.approved_at.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulletin_publication">
                  Boletim de publicacao
                </Label>
                <Input
                  id="bulletin_publication"
                  placeholder="Ex.: BG 456/2024"
                  aria-required={requiresPublicationData}
                  {...register("bulletin_publication")}
                />
                {requiresPublicationData ? (
                  <p className="text-xs text-slate-500">
                    Obrigatorio quando o status estiver como publicado.
                  </p>
                ) : null}
                {errors.bulletin_publication ? (
                  <p className="text-sm text-destructive">
                    {errors.bulletin_publication.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_at">Data de publicacao</Label>
                <Input
                  id="published_at"
                  type="date"
                  aria-required={requiresPublicationData}
                  {...register("published_at")}
                />
                {requiresPublicationData ? (
                  <p className="text-xs text-slate-500">
                    Obrigatoria quando o processo estiver publicado.
                  </p>
                ) : null}
                {errors.published_at ? (
                  <p className="text-sm text-destructive">
                    {errors.published_at.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea
                  id="notes"
                  placeholder="Observacoes adicionais sobre o requerimento..."
                  rows={4}
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
                  mode === "create"
                    ? "/police-officer-retirement-requests"
                    : `/police-officer-retirement-requests/${policeOfficerRetirementRequest?.id}`
                }
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : mode === "create"
                  ? "Criar requerimento"
                  : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
