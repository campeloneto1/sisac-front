"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { authService } from "@/services/auth/service";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token obrigatório."),
    email: z.string().email("Informe um e-mail válido."),
    password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres."),
    password_confirmation: z.string().min(8, "Confirme a nova senha."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "A confirmacao precisa ser igual a nova senha.",
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaults = useMemo(
    () => ({
      email: searchParams.get("email") ?? "",
      token: searchParams.get("token") ?? "",
      password: "",
      password_confirmation: "",
    }),
    [searchParams],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: defaults,
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword(values);
      toast.success(response.message);
      router.push("/login");
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
          Nova senha
        </span>
        <div>
          <CardTitle className="text-3xl">Redefinir senha</CardTitle>
          <CardDescription className="mt-2">
            Use o token recebido por e-mail para cadastrar sua nova senha.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="token">Token *</Label>
            <Input id="token" placeholder="Cole o token aqui" {...register("token")} />
            {errors.token ? <p className="text-sm text-destructive">{errors.token.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" placeholder="você@empresa.com" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nova senha *</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirmar nova senha *</Label>
            <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
            {errors.password_confirmation ? (
              <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
            ) : null}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            <KeyRound className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <Link href="/login" className="mt-5 inline-flex text-sm font-medium text-primary hover:opacity-80">
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}

