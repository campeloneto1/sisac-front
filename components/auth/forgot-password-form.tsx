"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { authService } from "@/services/auth/service";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotPasswordSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(values);
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl border-white/70 bg-white/85 shadow-spotlight backdrop-blur">
      <CardHeader className="space-y-3">
        <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Recuperacao de senha
        </span>
        <div>
          <CardTitle className="text-3xl">Receber link de redefinicao</CardTitle>
          <CardDescription className="mt-2">
            Informe seu e-mail. Se ele estiver cadastrado, a API enviara um link de recuperacao.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" placeholder="voce@empresa.com" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar link"}
            <MailCheck className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <Link href="/login" className="inline-flex items-center text-sm font-medium text-primary hover:opacity-80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}

