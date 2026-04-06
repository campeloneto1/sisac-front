"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePoliceOfficerVacationMutation, useUpdatePoliceOfficerVacationMutation } from "@/hooks/use-police-officer-vacation-mutations";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import type { CreatePoliceOfficerVacationDTO, PoliceOfficerVacationItem, UpdatePoliceOfficerVacationDTO } from "@/types/police-officer-vacation.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const policeOfficerVacationFormSchema = z.object({
  police_officer_id: z.string().refine((value) => value !== "none", "Selecione o policial."),
  reference_year: z.string().min(4, "Informe o ano de referencia."),
  total_days: z.string().min(1, "Informe o total de dias."),
  sold_days: z.string().optional(),
  authorization_bulletin: z.string().max(50, "O boletim deve ter no maximo 50 caracteres.").optional(),
  fractionation_bulletin: z.string().max(50, "O boletim deve ter no maximo 50 caracteres.").optional(),
  sale_bulletin: z.string().max(50, "O boletim deve ter no maximo 50 caracteres.").optional(),
}).superRefine((values, context) => {
  const totalDays = Number(values.total_days || 0);
  const soldDays = Number(values.sold_days || 0);

  if (!Number.isFinite(totalDays) || totalDays < 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["total_days"],
      message: "Informe um total de dias valido.",
    });
  }

  if (values.sold_days?.trim()) {
    if (!Number.isFinite(soldDays) || soldDays < 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sold_days"],
        message: "Informe um total vendido valido.",
      });
    }

    if (soldDays > totalDays) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sold_days"],
        message: "Os dias vendidos nao podem ultrapassar o total de dias.",
      });
    }
  }
});

type PoliceOfficerVacationFormValues = z.infer<typeof policeOfficerVacationFormSchema>;

interface PoliceOfficerVacationFormProps {
  mode: "create" | "edit";
  policeOfficerVacation?: PoliceOfficerVacationItem;
}

export function PoliceOfficerVacationForm({ mode, policeOfficerVacation }: PoliceOfficerVacationFormProps) {
  const router = useRouter();
  const createMutation = useCreatePoliceOfficerVacationMutation();
  const updateMutation = useUpdatePoliceOfficerVacationMutation();
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PoliceOfficerVacationFormValues>({
    resolver: zodResolver(policeOfficerVacationFormSchema),
    defaultValues: {
      police_officer_id: policeOfficerVacation?.police_officer_id ? String(policeOfficerVacation.police_officer_id) : "none",
      reference_year: policeOfficerVacation?.reference_year ? String(policeOfficerVacation.reference_year) : "",
      total_days: policeOfficerVacation?.total_days ? String(policeOfficerVacation.total_days) : "30",
      sold_days: policeOfficerVacation?.sold_days ? String(policeOfficerVacation.sold_days) : "",
      authorization_bulletin: policeOfficerVacation?.authorization_bulletin ?? "",
      fractionation_bulletin: policeOfficerVacation?.fractionation_bulletin ?? "",
      sale_bulletin: policeOfficerVacation?.sale_bulletin ?? "",
    },
  });

  const selectedPoliceOfficerId = useWatch({ control, name: "police_officer_id" });
  const totalDays = useWatch({ control, name: "total_days" });
  const soldDays = useWatch({ control, name: "sold_days" });

  useEffect(() => {
    if (!policeOfficerVacation) {
      return;
    }

    reset({
      police_officer_id: String(policeOfficerVacation.police_officer_id),
      reference_year: String(policeOfficerVacation.reference_year),
      total_days: String(policeOfficerVacation.total_days),
      sold_days: policeOfficerVacation.sold_days ? String(policeOfficerVacation.sold_days) : "",
      authorization_bulletin: policeOfficerVacation.authorization_bulletin ?? "",
      fractionation_bulletin: policeOfficerVacation.fractionation_bulletin ?? "",
      sale_bulletin: policeOfficerVacation.sale_bulletin ?? "",
    });
  }, [policeOfficerVacation, reset]);

  async function onSubmit(values: PoliceOfficerVacationFormValues) {
    const payloadBase = {
      police_officer_id: Number(values.police_officer_id),
      reference_year: Number(values.reference_year),
      total_days: Number(values.total_days),
      sold_days: values.sold_days?.trim() ? Number(values.sold_days) : null,
      authorization_bulletin: values.authorization_bulletin?.trim() || null,
      fractionation_bulletin: values.fractionation_bulletin?.trim() || null,
      sale_bulletin: values.sale_bulletin?.trim() || null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreatePoliceOfficerVacationDTO);
      router.push(`/police-officer-vacations/${response.data.id}`);
      return;
    }

    if (!policeOfficerVacation) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: policeOfficerVacation.id,
      payload: payloadBase satisfies UpdatePoliceOfficerVacationDTO,
    });
    router.push(`/police-officer-vacations/${response.data.id}`);
  }

  const availableForPlanning = Math.max(0, Number(totalDays || 0) - Number(soldDays || 0));
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo registro de ferias" : "Editar registro de ferias"}</CardTitle>
        <CardDescription>
          Cadastre o saldo anual de ferias do policial e ja deixe pronto o contexto para fracionamento em ate dois periodos ou venda de dias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Dados principais</h3>
              <p className="text-sm text-slate-500">Policial, ano de referencia e quantidade total de dias disponiveis no registro.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2 xl:col-span-3">
                <Label>Policial</Label>
                <Select value={selectedPoliceOfficerId} onValueChange={(value) => setValue("police_officer_id", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {(policeOfficersQuery.data?.data ?? []).map((officer) => (
                      <SelectItem key={officer.id} value={String(officer.id)}>
                        {(officer.name ?? officer.user?.name ?? officer.war_name) || `Policial #${officer.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.police_officer_id ? <p className="text-sm text-destructive">{errors.police_officer_id.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacation-reference-year">Ano de referencia</Label>
                <Input id="vacation-reference-year" inputMode="numeric" placeholder="Ex.: 2025" {...register("reference_year")} />
                {errors.reference_year ? <p className="text-sm text-destructive">{errors.reference_year.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacation-total-days">Total de dias</Label>
                <Input id="vacation-total-days" inputMode="numeric" placeholder="Ex.: 30" {...register("total_days")} />
                {errors.total_days ? <p className="text-sm text-destructive">{errors.total_days.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacation-sold-days">Dias vendidos</Label>
                <Input id="vacation-sold-days" inputMode="numeric" placeholder="Ex.: 10" {...register("sold_days")} />
                {errors.sold_days ? <p className="text-sm text-destructive">{errors.sold_days.message}</p> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Saldo previsto para gozo: <span className="font-semibold text-slate-900">{availableForPlanning} dias</span>.
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Boletins</h3>
              <p className="text-sm text-slate-500">Registre os boletins de autorizacao, fracionamento e venda quando houver.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="authorization_bulletin">Boletim de autorizacao</Label>
                <Input id="authorization_bulletin" placeholder="Ex.: BG-2025/100" {...register("authorization_bulletin")} />
                {errors.authorization_bulletin ? <p className="text-sm text-destructive">{errors.authorization_bulletin.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fractionation_bulletin">Boletim de fracionamento</Label>
                <Input id="fractionation_bulletin" placeholder="Ex.: BG-2025/101" {...register("fractionation_bulletin")} />
                {errors.fractionation_bulletin ? <p className="text-sm text-destructive">{errors.fractionation_bulletin.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_bulletin">Boletim de venda</Label>
                <Input id="sale_bulletin" placeholder="Ex.: BG-2025/102" {...register("sale_bulletin")} />
                {errors.sale_bulletin ? <p className="text-sm text-destructive">{errors.sale_bulletin.message}</p> : null}
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild type="button" variant="outline">
              <Link href={mode === "create" ? "/police-officer-vacations" : `/police-officer-vacations/${policeOfficerVacation?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar registro" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
