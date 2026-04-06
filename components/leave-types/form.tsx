"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation } from "@/hooks/use-leave-type-mutations";
import type { CreateLeaveTypeDTO, LeaveTypeItem, UpdateLeaveTypeDTO } from "@/types/leave-type.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const leaveTypeFormSchema = z
  .object({
    name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres.").max(100, "O nome deve ter no maximo 100 caracteres."),
    slug: z.string().max(120, "O slug deve ter no maximo 120 caracteres.").optional(),
    description: z.string().optional(),
    requires_medical_report: z.boolean(),
    affects_salary: z.boolean(),
    max_days: z.string().optional(),
  })
  .superRefine((values, context) => {
    const parsedMaxDays = values.max_days?.trim() ? Number(values.max_days) : null;

    if (values.requires_medical_report && parsedMaxDays === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_days"],
        message: "Informe a quantidade maxima de dias quando o tipo exige laudo medico.",
      });
    }

    if (parsedMaxDays !== null && (!Number.isInteger(parsedMaxDays) || parsedMaxDays < 1 || parsedMaxDays > 3650)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["max_days"],
        message: "A quantidade maxima de dias deve ser um numero inteiro entre 1 e 3650.",
      });
    }
  });

type LeaveTypeFormValues = z.infer<typeof leaveTypeFormSchema>;

interface LeaveTypeFormProps {
  mode: "create" | "edit";
  leaveType?: LeaveTypeItem;
}

export function LeaveTypeForm({ mode, leaveType }: LeaveTypeFormProps) {
  const router = useRouter();
  const createMutation = useCreateLeaveTypeMutation();
  const updateMutation = useUpdateLeaveTypeMutation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: {
      name: leaveType?.name ?? "",
      slug: leaveType?.slug ?? "",
      description: leaveType?.description ?? "",
      requires_medical_report: leaveType?.requires_medical_report ?? false,
      affects_salary: leaveType?.affects_salary ?? false,
      max_days: leaveType?.max_days?.toString() ?? "",
    },
  });
  const requiresMedicalReport = useWatch({
    control,
    name: "requires_medical_report",
  });
  const affectsSalary = useWatch({
    control,
    name: "affects_salary",
  });

  useEffect(() => {
    if (!leaveType) {
      return;
    }

    reset({
      name: leaveType.name,
      slug: leaveType.slug,
      description: leaveType.description ?? "",
      requires_medical_report: leaveType.requires_medical_report,
      affects_salary: leaveType.affects_salary,
      max_days: leaveType.max_days?.toString() ?? "",
    });
  }, [leaveType, reset]);

  async function onSubmit(values: LeaveTypeFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: values.slug?.trim() ? values.slug.trim() : null,
      description: values.description?.trim() ? values.description.trim() : null,
      requires_medical_report: values.requires_medical_report,
      affects_salary: values.affects_salary,
      max_days: values.max_days?.trim() ? Number(values.max_days) : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateLeaveTypeDTO);
      router.push(`/leave-types/${response.data.id}`);
      return;
    }

    if (!leaveType) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: leaveType.id,
      payload: payloadBase satisfies UpdateLeaveTypeDTO,
    });
    router.push(`/leave-types/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo tipo de afastamento" : "Editar tipo de afastamento"}</CardTitle>
        <CardDescription>
          Tipos de afastamento ficam dentro de Administrador e definem regras basicas dos afastamentos dos policiais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Licenca medica, ferias, dispensa" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="Opcional. Se vazio, a API gera automaticamente." {...register("slug")} />
            {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
          </div>

          <div className={`space-y-2 ${requiresMedicalReport ? "rounded-2xl border border-primary/20 bg-primary/5 p-4" : ""}`}>
            <Label htmlFor="max_days">Quantidade maxima de dias</Label>
            <Input id="max_days" inputMode="numeric" placeholder="Ex.: 30" {...register("max_days")} />
            <p className="text-xs text-slate-500">
              {requiresMedicalReport
                ? "Obrigatorio quando o tipo exige laudo medico."
                : "Opcional. Use para limitar a duracao maxima deste afastamento."}
            </p>
            {errors.max_days ? <p className="text-sm text-destructive">{errors.max_days.message}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" placeholder="Descreva quando este tipo de afastamento deve ser utilizado." {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4 md:col-span-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="requires_medical_report"
                checked={requiresMedicalReport}
                onCheckedChange={(checked) => setValue("requires_medical_report", checked === true, { shouldDirty: true, shouldValidate: true })}
              />
              <div className="space-y-1">
                <Label htmlFor="requires_medical_report">Exige laudo medico</Label>
                <p className="text-sm text-slate-500">Ative quando o afastamento precisar de comprovacao medica e controle mais rigido de dias.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="affects_salary"
                checked={affectsSalary}
                onCheckedChange={(checked) => setValue("affects_salary", checked === true, { shouldDirty: true, shouldValidate: true })}
              />
              <div className="space-y-1">
                <Label htmlFor="affects_salary">Afeta salario</Label>
                <p className="text-sm text-slate-500">Use quando o afastamento impactar remuneracao, desconto ou outra regra financeira.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 md:col-span-2">
            Este cadastro e global. Alteracoes aqui afetam os formularios e os filtros usados em afastamentos de policiais.
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/leave-types" : `/leave-types/${leaveType?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar tipo" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
