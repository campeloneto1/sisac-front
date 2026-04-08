"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePoliceOfficerLeaveMutation, useUpdatePoliceOfficerLeaveMutation } from "@/hooks/use-police-officer-leave-mutations";
import { usePoliceOfficerLeaves } from "@/hooks/use-police-officer-leaves";
import { useLeaveTypes } from "@/hooks/use-leave-types";
import { formatPoliceOfficerOptionLabel } from "@/lib/option-labels";
import { policeOfficersService } from "@/services/police-officers/service";
import {
  POLICE_OFFICER_LEAVE_COPEM_RESULT_OPTIONS,
  POLICE_OFFICER_LEAVE_STATUS_OPTIONS,
  type CreatePoliceOfficerLeaveDTO,
  type PoliceOfficerLeaveItem,
  type UpdatePoliceOfficerLeaveDTO,
} from "@/types/police-officer-leave.type";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const policeOfficerLeaveFormSchema = z
  .object({
    police_officer_id: z.string().refine((value) => value !== "none", "Selecione o policial."),
    leave_type_id: z.string().refine((value) => value !== "none", "Selecione o tipo de afastamento."),
    previous_leave_id: z.string(),
    is_renewal: z.boolean(),
    start_date: z.string().min(1, "Informe a data inicial."),
    end_date: z.string().min(1, "Informe a data final."),
    compen_date: z.string().optional(),
    crm_number: z.string().max(50, "O CRM deve ter no máximo 50 caracteres."),
    cid_code: z.string().max(20, "O CID deve ter no máximo 20 caracteres."),
    hospital_name: z.string().max(150, "O hospital deve ter no máximo 150 caracteres."),
    notes: z.string().optional(),
    status: z.string(),
    requires_copem: z.boolean(),
    copem_protocol: z.string().max(100, "O protocolo COPEM deve ter no máximo 100 caracteres."),
    copem_scheduled_date: z.string().optional(),
    copem_evaluation_date: z.string().optional(),
    copem_report_date: z.string().optional(),
    copem_result: z.string(),
    copem_notes: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.end_date && values.start_date && values.end_date < values.start_date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "A data final deve ser igual ou posterior a data inicial.",
      });
    }

    if (values.compen_date && values.end_date && values.compen_date < values.end_date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compen_date"],
        message: "A data de compensacao deve ser igual ou posterior ao fim do afastamento.",
      });
    }

    if (values.is_renewal && values.previous_leave_id === "none") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["previous_leave_id"],
        message: "Selecione o afastamento anterior quando marcar renovação.",
      });
    }
  });

type PoliceOfficerLeaveFormValues = z.infer<typeof policeOfficerLeaveFormSchema>;

interface PoliceOfficerLeaveFormProps {
  mode: "create" | "edit";
  policeOfficerLeave?: PoliceOfficerLeaveItem;
}

export function PoliceOfficerLeaveForm({ mode, policeOfficerLeave }: PoliceOfficerLeaveFormProps) {
  const router = useRouter();
  const createMutation = useCreatePoliceOfficerLeaveMutation();
  const updateMutation = useUpdatePoliceOfficerLeaveMutation();
  const leaveTypesQuery = useLeaveTypes({ per_page: 100 });
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PoliceOfficerLeaveFormValues>({
    resolver: zodResolver(policeOfficerLeaveFormSchema),
    defaultValues: {
      police_officer_id: policeOfficerLeave?.police_officer_id ? String(policeOfficerLeave.police_officer_id) : "none",
      leave_type_id: policeOfficerLeave?.leave_type_id ? String(policeOfficerLeave.leave_type_id) : "none",
      previous_leave_id: policeOfficerLeave?.previous_leave_id ? String(policeOfficerLeave.previous_leave_id) : "none",
      is_renewal: policeOfficerLeave?.is_renewal ?? false,
      start_date: policeOfficerLeave?.start_date ?? "",
      end_date: policeOfficerLeave?.end_date ?? "",
      compen_date: policeOfficerLeave?.compen_date ?? "",
      crm_number: policeOfficerLeave?.crm_number ?? "",
      cid_code: policeOfficerLeave?.cid_code ?? "",
      hospital_name: policeOfficerLeave?.hospital_name ?? "",
      notes: policeOfficerLeave?.notes ?? "",
      status: policeOfficerLeave?.status?.value ?? "auto",
      requires_copem: policeOfficerLeave?.requires_copem ?? false,
      copem_protocol: policeOfficerLeave?.copem_protocol ?? "",
      copem_scheduled_date: policeOfficerLeave?.copem_scheduled_date ?? "",
      copem_evaluation_date: policeOfficerLeave?.copem_evaluation_date ?? "",
      copem_report_date: policeOfficerLeave?.copem_report_date ?? "",
      copem_result: policeOfficerLeave?.copem_result?.value ?? "none",
      copem_notes: policeOfficerLeave?.copem_notes ?? "",
    },
  });

  const selectedPoliceOfficerId = useWatch({ control, name: "police_officer_id" });
  const selectedLeaveTypeId = useWatch({ control, name: "leave_type_id" });
  const isRenewal = useWatch({ control, name: "is_renewal" });
  const requiresCopem = useWatch({ control, name: "requires_copem" });
  const selectedStatus = useWatch({ control, name: "status" });
  const selectedPreviousLeaveId = useWatch({ control, name: "previous_leave_id" });
  const selectedCopemResult = useWatch({ control, name: "copem_result" });

  const previousLeavesQuery = usePoliceOfficerLeaves({
    per_page: 100,
    police_officer_id: selectedPoliceOfficerId !== "none" ? Number(selectedPoliceOfficerId) : null,
  });

  const selectedLeaveType = useMemo(
    () => leaveTypesQuery.data?.data.find((item) => item.id === Number(selectedLeaveTypeId)),
    [leaveTypesQuery.data?.data, selectedLeaveTypeId],
  );

  useEffect(() => {
    if (!policeOfficerLeave) {
      return;
    }

    reset({
      police_officer_id: String(policeOfficerLeave.police_officer_id),
      leave_type_id: String(policeOfficerLeave.leave_type_id),
      previous_leave_id: policeOfficerLeave.previous_leave_id ? String(policeOfficerLeave.previous_leave_id) : "none",
      is_renewal: policeOfficerLeave.is_renewal ?? false,
      start_date: policeOfficerLeave.start_date ?? "",
      end_date: policeOfficerLeave.end_date ?? "",
      compen_date: policeOfficerLeave.compen_date ?? "",
      crm_number: policeOfficerLeave.crm_number ?? "",
      cid_code: policeOfficerLeave.cid_code ?? "",
      hospital_name: policeOfficerLeave.hospital_name ?? "",
      notes: policeOfficerLeave.notes ?? "",
      status: policeOfficerLeave.status?.value ?? "auto",
      requires_copem: policeOfficerLeave.requires_copem ?? false,
      copem_protocol: policeOfficerLeave.copem_protocol ?? "",
      copem_scheduled_date: policeOfficerLeave.copem_scheduled_date ?? "",
      copem_evaluation_date: policeOfficerLeave.copem_evaluation_date ?? "",
      copem_report_date: policeOfficerLeave.copem_report_date ?? "",
      copem_result: policeOfficerLeave.copem_result?.value ?? "none",
      copem_notes: policeOfficerLeave.copem_notes ?? "",
    });
  }, [policeOfficerLeave, reset]);

  async function onSubmit(values: PoliceOfficerLeaveFormValues) {
    const payloadBase = {
      police_officer_id: Number(values.police_officer_id),
      leave_type_id: Number(values.leave_type_id),
      previous_leave_id: values.previous_leave_id !== "none" ? Number(values.previous_leave_id) : null,
      is_renewal: values.is_renewal,
      start_date: values.start_date,
      end_date: values.end_date,
      compen_date: values.compen_date?.trim() ? values.compen_date : null,
      crm_number: values.crm_number.trim() || null,
      cid_code: values.cid_code.trim() || null,
      hospital_name: values.hospital_name.trim() || null,
      notes: values.notes?.trim() || null,
      status: values.status !== "auto" ? values.status : null,
      requires_copem: values.requires_copem,
      copem_protocol: values.copem_protocol.trim() || null,
      copem_scheduled_date: values.copem_scheduled_date?.trim() ? values.copem_scheduled_date : null,
      copem_evaluation_date: values.copem_evaluation_date?.trim() ? values.copem_evaluation_date : null,
      copem_report_date: values.copem_report_date?.trim() ? values.copem_report_date : null,
      copem_result: values.copem_result !== "none" ? values.copem_result : null,
      copem_notes: values.copem_notes?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreatePoliceOfficerLeaveDTO);
      router.push(`/police-officer-leaves/${response.data.id}`);
      return;
    }

    if (!policeOfficerLeave) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: policeOfficerLeave.id,
      payload: payloadBase satisfies UpdatePoliceOfficerLeaveDTO,
    });
    router.push(`/police-officer-leaves/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const selectedPoliceOfficerOption = policeOfficerLeave?.police_officer
    ? {
        value: String(policeOfficerLeave.police_officer_id),
        label: formatPoliceOfficerOptionLabel({
          ...policeOfficerLeave.police_officer,
          id: policeOfficerLeave.police_officer_id,
        }),
      }
    : null;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo afastamento" : "Editar afastamento"}</CardTitle>
        <CardDescription>
          Fluxo completo de afastamento do policial, com dados do período, válidações médicas, renovação e acompanhamento de COPEM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Dados principais</h3>
              <p className="text-sm text-slate-500">Selecione o policial, o tipo de afastamento e o período principal.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Policial</Label>
                <AsyncSearchableSelect
                  value={selectedPoliceOfficerId === "none" ? undefined : selectedPoliceOfficerId}
                  onValueChange={(value) => setValue("police_officer_id", value, { shouldValidate: true })}
                  queryKey={["police-officer-leaves", "police-officers"]}
                  loadPage={({ page, search }) =>
                    policeOfficersService.index({
                      page,
                      per_page: 20,
                      search: search || undefined,
                    })
                  }
                  mapOption={(officer) => ({
                    value: String(officer.id),
                    label: formatPoliceOfficerOptionLabel(officer),
                  })}
                  selectedOption={selectedPoliceOfficerOption}
                  placeholder="Selecione"
                  searchPlaceholder="Buscar policial por nome ou matrícula"
                  emptyMessage="Nenhum policial encontrado."
                />
                {errors.police_officer_id ? <p className="text-sm text-destructive">{errors.police_officer_id.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Tipo de afastamento</Label>
                <Select value={selectedLeaveTypeId} onValueChange={(value) => setValue("leave_type_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {(leaveTypesQuery.data?.data ?? []).map((leaveType) => (
                      <SelectItem key={leaveType.id} value={String(leaveType.id)}>
                        {leaveType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leave_type_id ? <p className="text-sm text-destructive">{errors.leave_type_id.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Data inicial</Label>
                <Input id="start_date" type="date" {...register("start_date")} />
                {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data final</Label>
                <Input id="end_date" type="date" {...register("end_date")} />
                {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="compen_date">Data de compensacao</Label>
                <Input id="compen_date" type="date" {...register("compen_date")} />
                {errors.compen_date ? <p className="text-sm text-destructive">{errors.compen_date.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setValue("status", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Automático" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático pela API</SelectItem>
                    {POLICE_OFFICER_LEAVE_STATUS_OPTIONS.map((statusOption) => (
                      <SelectItem key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedLeaveType ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {selectedLeaveType.requires_medical_report
                  ? "Este tipo exige comprovação médica. O CRM do profissional responsável deve ser informado."
                  : "Este tipo não exige laudo médico por regra do cadastro."}
                {selectedLeaveType.max_days ? ` Limite configurado: ${selectedLeaveType.max_days} dias.` : ""}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Informações médicas e administrativas</h3>
              <p className="text-sm text-slate-500">Campos usados em licencas médicas, acompanhamento e observações gerais.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className={`space-y-2 ${selectedLeaveType?.requires_medical_report ? "rounded-2xl border border-primary/20 bg-primary/5 p-4" : ""}`}>
                <Label htmlFor="crm_number">CRM</Label>
                <Input id="crm_number" placeholder="Ex.: CRM/PE 12345" {...register("crm_number")} />
                {errors.crm_number ? <p className="text-sm text-destructive">{errors.crm_number.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cid_code">CID</Label>
                <Input id="cid_code" placeholder="Ex.: M54.5" {...register("cid_code")} />
                {errors.cid_code ? <p className="text-sm text-destructive">{errors.cid_code.message}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hospital_name">Hospital/unidade de atendimento</Label>
                <Input id="hospital_name" placeholder="Ex.: Hospital da PM, UPA, clinica conveniada" {...register("hospital_name")} />
                {errors.hospital_name ? <p className="text-sm text-destructive">{errors.hospital_name.message}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" placeholder="Registre detalhes relevantes sobre o afastamento." {...register("notes")} />
                {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Renovação</h3>
              <p className="text-sm text-slate-500">Use quando este afastamento for continuidade de um anterior.</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="is_renewal"
                  checked={isRenewal}
                  onCheckedChange={(checked) => setValue("is_renewal", checked === true, { shouldDirty: true, shouldValidate: true })}
                />
                <div className="space-y-1">
                  <Label htmlFor="is_renewal">Marcar como renovação</Label>
                  <p className="text-sm text-slate-500">A API permite sobreposição de período quando o afastamento e registrado como renovação.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Afastamento anterior</Label>
                <Select value={selectedPreviousLeaveId} onValueChange={(value) => setValue("previous_leave_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {(previousLeavesQuery.data?.data ?? [])
                      .filter((leave) => leave.id !== policeOfficerLeave?.id)
                      .map((leave) => (
                        <SelectItem key={leave.id} value={String(leave.id)}>
                          {(leave.leave_type?.name ?? "Afastamento")} • {leave.start_date ?? "-"} ate {leave.end_date ?? "-"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.previous_leave_id ? <p className="text-sm text-destructive">{errors.previous_leave_id.message}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">COPEM</h3>
              <p className="text-sm text-slate-500">A API pode definir parte dessa logica automaticamente, mas o formulario permite acompanhamento completo.</p>
            </div>
            <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="requires_copem"
                  checked={requiresCopem}
                  onCheckedChange={(checked) => setValue("requires_copem", checked === true, { shouldDirty: true, shouldValidate: true })}
                />
                <div className="space-y-1">
                  <Label htmlFor="requires_copem">Requer COPEM</Label>
                  <p className="text-sm text-slate-500">Afastações médicas acima de 3 dias costumam ser marcadas automaticamente pela API.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="copem_protocol">Protocolo COPEM</Label>
                  <Input id="copem_protocol" {...register("copem_protocol")} />
                  {errors.copem_protocol ? <p className="text-sm text-destructive">{errors.copem_protocol.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label>Resultado COPEM</Label>
                  <Select value={selectedCopemResult} onValueChange={(value) => setValue("copem_result", value, { shouldValidate: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Não informado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não informado</SelectItem>
                      {POLICE_OFFICER_LEAVE_COPEM_RESULT_OPTIONS.map((result) => (
                        <SelectItem key={result.value} value={result.value}>
                          {result.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copem_scheduled_date">Data da pericia COPEM</Label>
                  <Input id="copem_scheduled_date" type="date" {...register("copem_scheduled_date")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copem_evaluation_date">Data da avaliação</Label>
                  <Input id="copem_evaluation_date" type="date" {...register("copem_evaluation_date")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copem_report_date">Data do laudo</Label>
                  <Input id="copem_report_date" type="date" {...register("copem_report_date")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="copem_notes">Observações COPEM</Label>
                  <Textarea id="copem_notes" placeholder="Detalhes da pericia, restricoes ou observações da junta." {...register("copem_notes")} />
                  {errors.copem_notes ? <p className="text-sm text-destructive">{errors.copem_notes.message}</p> : null}
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/police-officer-leaves" : `/police-officer-leaves/${policeOfficerLeave?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar afastamento" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
