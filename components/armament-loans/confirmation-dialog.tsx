"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";

import type {
  ArmamentLoanConfirmationDTO,
  ArmamentLoanConfirmationMethod,
} from "@/types/armament-loan.type";
import { Button } from "@/components/ui/button";
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

const confirmationSchema = z.object({
  credential: z.string().min(1, "Informe a senha do confirmante."),
  agreed: z.boolean().refine((value) => value, {
    message: "O aceite do policial é obrigatório para continuar.",
  }),
});

type ConfirmationFormValues = z.output<typeof confirmationSchema>;

interface ArmamentLoanConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  officerLabel: string;
  confirmerName?: string | null;
  confirmerEmail?: string | null;
  confirmedByUserId: number;
  isPending: boolean;
  onConfirm: (confirmation: ArmamentLoanConfirmationDTO) => Promise<void>;
}

export function ArmamentLoanConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  officerLabel,
  confirmerName,
  confirmerEmail,
  confirmedByUserId,
  isPending,
  onConfirm,
}: ArmamentLoanConfirmationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<
    z.input<typeof confirmationSchema>,
    unknown,
    ConfirmationFormValues
  >({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      credential: "",
      agreed: false,
    },
  });
  const agreed = useWatch({ control, name: "agreed" });

  useEffect(() => {
    if (!open) {
      reset({
        credential: "",
        agreed: false,
      });
    }
  }, [open, reset]);

  async function submit(values: ConfirmationFormValues) {
    await onConfirm({
      confirmed_by_user_id: confirmedByUserId,
      method: "password" satisfies ArmamentLoanConfirmationMethod,
      credential: values.credential,
      agreed: values.agreed,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-[24px] border border-slate-200/70 bg-slate-50 p-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">{officerLabel}</p>
              <p className="text-sm text-slate-500">
                Confirmante: {confirmerName || "Usuário vinculado ao policial"}
              </p>
              <p className="text-xs text-slate-500">
                {confirmerEmail || "Sem e-mail disponível"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="armament-loan-confirmation-password">Senha do confirmante</Label>
            <Input
              id="armament-loan-confirmation-password"
              type="password"
              autoComplete="current-password"
              {...register("credential")}
            />
            {errors.credential ? (
              <p className="text-sm text-destructive">{errors.credential.message}</p>
            ) : null}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) =>
                setValue("agreed", Boolean(checked), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            <div>
              <p className="text-sm font-medium text-slate-900">
                O policial confirma esta operação
              </p>
              <p className="text-xs text-slate-500">
                Este aceite será auditado com operador, confirmante, subunidade, data e snapshot da movimentação.
              </p>
            </div>
          </div>
          {errors.agreed ? (
            <p className="text-sm text-destructive">{errors.agreed.message}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={isPending} onClick={handleSubmit(submit)}>
            {isPending ? "Confirmando..." : "Confirmar operação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
