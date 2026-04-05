"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "ana@sisac.local",
      password: "123456",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);

    try {
      await login(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="hidden rounded-[32px] border border-white/50 bg-slate-950 p-10 text-white shadow-spotlight lg:block">
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200">
              SISAC Platform
            </span>
            <div className="space-y-4">
              <h1 className="font-display text-5xl leading-[1.05]">
                Controle institucional com uma base moderna e preparada para escalar.
              </h1>
              <p className="max-w-xl text-base text-slate-300">
                A area publica de login e a area autenticada ja nascem separadas para acomodar RBAC, contexto
                de subunidade e os proximos CRUDs do sistema.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <ShieldCheck className="h-5 w-5 text-orange-300" />
              <p className="mt-4 text-sm text-slate-200">Permissoes reativas prontas para integrar com Policies.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <LockKeyhole className="h-5 w-5 text-teal-300" />
              <p className="mt-4 text-sm text-slate-200">Fluxo de autenticacao inicial pronto para evoluir ao backend.</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-white/70 bg-white/85 shadow-spotlight backdrop-blur">
        <CardHeader className="space-y-3">
          <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Area de acesso
          </span>
          <div>
            <CardTitle className="text-3xl">Entrar no sistema</CardTitle>
            <CardDescription className="mt-2 text-sm">
              Use os dados de exemplo para entrar e visualizar a shell autenticada inicial.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" placeholder="voce@empresa.com" {...register("email")} />
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Sua senha" {...register("password")} />
              {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
            </div>

            <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Acessar dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

