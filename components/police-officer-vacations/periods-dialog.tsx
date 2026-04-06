"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePoliceOfficerVacationPeriodMutation, useUpdatePoliceOfficerVacationPeriodMutation } from "@/hooks/use-police-officer-vacation-mutations";
import { POLICE_OFFICER_VACATION_PERIOD_STATUS_OPTIONS, type CreatePoliceOfficerVacationPeriodDTO, type PoliceOfficerVacationPeriodItem, type UpdatePoliceOfficerVacationPeriodDTO } from "@/types/police-officer-vacation.type";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const periodSchema = z.object({
  start_date: z.string().min(1, "Informe a data inicial."),
  end_date: z.string().min(1, "Informe a data final."),
  status: z.string(),
  bulletin_start: z.string().max(50, "O boletim deve ter no maximo 50 caracteres.").optional(),
  bulletin_return: z.string().max(50, "O boletim deve ter no maximo 50 caracteres.").optional(),
}).superRefine((values, context) => {
  if (values.end_date < values.start_date) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "A data final deve ser igual ou posterior a data inicial.",
    });
  }
});

type PeriodFormValues = z.infer<typeof periodSchema>;

interface PoliceOfficerVacationPeriodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policeOfficerVacationId: number;
  period?: PoliceOfficerVacationPeriodItem | null;
}

export function PoliceOfficerVacationPeriodsDialog({
  open,
  onOpenChange,
  policeOfficerVacationId,
  period,
}: PoliceOfficerVacationPeriodsDialogProps) {
  const createMutation = useCreatePoliceOfficerVacationPeriodMutation();
  const updateMutation = useUpdatePoliceOfficerVacationPeriodMutation();
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      start_date: period?.start_date ?? "",
      end_date: period?.end_date ?? "",
      status: period?.status?.value ?? "planned",
      bulletin_start: period?.bulletin_start ?? "",
      bulletin_return: period?.bulletin_return ?? "",
    },
  });

  const selectedStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    reset({
      start_date: period?.start_date ?? "",
      end_date: period?.end_date ?? "",
      status: period?.status?.value ?? "planned",
      bulletin_start: period?.bulletin_start ?? "",
      bulletin_return: period?.bulletin_return ?? "",
    });
  }, [open, period, reset]);

  async function onSubmit(values: PeriodFormValues) {
    const payloadBase = {
      police_officer_vacation_id: policeOfficerVacationId,
      start_date: values.start_date,
      end_date: values.end_date,
      status: values.status || null,
      bulletin_start: values.bulletin_start?.trim() || null,
      bulletin_return: values.bulletin_return?.trim() || null,
    };

    if (period) {
      await updateMutation.mutateAsync({
        id: period.id,
        payload: payloadBase satisfies UpdatePoliceOfficerVacationPeriodDTO,
      });
    } else {
      await createMutation.mutateAsync(payloadBase satisfies CreatePoliceOfficerVacationPeriodDTO);
    }

    onOpenChange(false);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{period ? "Editar periodo de ferias" : "Adicionar periodo de ferias"}</DialogTitle>
          <DialogDescription>
            Planeje o gozo em periodos separados, respeitando o saldo disponivel e evitando sobreposicao com outros afastamentos.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vacation-period-start">Data inicial</Label>
              <Input id="vacation-period-start" type="date" {...register("start_date")} />
              {errors.start_date ? <p className="text-sm text-destructive">{errors.start_date.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacation-period-end">Data final</Label>
              <Input id="vacation-period-end" type="date" {...register("end_date")} />
              {errors.end_date ? <p className="text-sm text-destructive">{errors.end_date.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setValue("status", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {POLICE_OFFICER_VACATION_PERIOD_STATUS_OPTIONS.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vacation-period-bulletin-start">Boletim de inicio</Label>
              <Input id="vacation-period-bulletin-start" placeholder="Ex.: BG-2025/120" {...register("bulletin_start")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacation-period-bulletin-return">Boletim de retorno</Label>
              <Input id="vacation-period-bulletin-return" placeholder="Ex.: BG-2025/121" {...register("bulletin_return")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : period ? "Salvar periodo" : "Adicionar periodo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
