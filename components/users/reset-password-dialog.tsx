"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useResetUserPasswordMutation } from "@/hooks/use-user-mutations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetUserPasswordSchema = z
  .object({
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine((data) => {
    if (!data.password && !data.password_confirmation) {
      return true;
    }

    return Boolean(data.password) && data.password === data.password_confirmation;
  }, {
    path: ["password_confirmation"],
    message: "A confirmacao precisa ser igual a senha.",
  });

type ResetUserPasswordFormValues = z.infer<typeof resetUserPasswordSchema>;

interface ResetPasswordDialogProps {
  userId: number;
  userName: string;
}

export function ResetPasswordDialog({ userId, userName }: ResetPasswordDialogProps) {
  const mutation = useResetUserPasswordMutation();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetUserPasswordFormValues>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: ResetUserPasswordFormValues) {
    await mutation.mutateAsync({
      id: userId,
      payload: {
        password: values.password?.trim() ? values.password : undefined,
        password_confirmation: values.password_confirmation?.trim() ? values.password_confirmation : undefined,
      },
    });

    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Resetar senha</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetar senha</DialogTitle>
          <DialogDescription>
            Você pode definir manualmente uma nova senha para {userName} ou deixar os campos vazios para a API gerar
            uma senha aleatoria e enviar por e-mail.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-2xl bg-secondary p-4 text-sm text-slate-700">
            A ação depende da permissão `resetPassword` no frontend. No backend atual, o endpoint ainda usa a policy
            de `update`.
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password">Nova senha</Label>
            <Input id="reset-password" type="password" {...register("password")} />
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password-confirmation">Confirmar nova senha</Label>
            <Input id="reset-password-confirmation" type="password" {...register("password_confirmation")} />
            {errors.password_confirmation ? (
              <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enviando..." : "Confirmar reset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
