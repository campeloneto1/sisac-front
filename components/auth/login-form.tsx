"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowRight, Bell, CheckCircle, Info, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePublicNotices } from "@/hooks/use-notices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NoticeType } from "@/types/notice.type";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
  device_name: z.string().max(255).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const noticeTypeConfig: Record<NoticeType, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: "text-blue-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400" },
  error: { icon: XCircle, color: "text-red-400" },
  success: { icon: CheckCircle, color: "text-emerald-400" },
};

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const publicNoticesQuery = usePublicNotices({ per_page: 5 });
  const publicNotices = publicNoticesQuery.data?.data ?? [];
  const hasPublicNotices = publicNotices.length > 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      device_name: "sisac-web",
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
            {hasPublicNotices ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-slate-300" />
                  <h1 className="font-display text-3xl leading-[1.05]">Avisos</h1>
                </div>
                <div className="space-y-3">
                  {publicNotices.map((notice) => {
                    const config = noticeTypeConfig[notice.type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={notice.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-100">{notice.title}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-300">{notice.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="font-display text-5xl leading-[1.05]">
                  Controle institucional com uma base moderna e preparada para escalar.
                </h1>
                <p className="max-w-xl text-base text-slate-300">
                  A area publica de login e a area autenticada já nascem separadas para acomodar RBAC, contexto
                  de subunidade e os proximos CRUDs do sistema.
                </p>
              </div>
            )}
          </div>

          {!hasPublicNotices && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="h-5 w-5 text-orange-300" />
                <p className="mt-4 text-sm text-slate-200">Permissões reativas prontas para integrar com Policies.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <LockKeyhole className="h-5 w-5 text-teal-300" />
                <p className="mt-4 text-sm text-slate-200">Fluxo de autenticacao inicial pronto para evoluir ao backend.</p>
              </div>
            </div>
          )}
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
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" placeholder="você@empresa.com" {...register("email")} />
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input id="password" type="password" placeholder="Sua senha" {...register("password")} />
              {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
            </div>

            <input type="hidden" {...register("device_name")} />

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-primary transition hover:opacity-80">
                Esqueci minha senha
              </Link>
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

