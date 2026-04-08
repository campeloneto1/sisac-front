"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuth } from "@/contexts/auth-context";
import { getApiErrorMessage } from "@/lib/api";
import { authService } from "@/services/auth/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  name: z.string().min(3, "O nome precisa ter ao menos 3 caracteres."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Informe sua senha atual."),
    password: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres."),
    password_confirmation: z
      .string()
      .min(8, "Confirme a nova senha."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "A confirmação da nova senha não confere.",
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ProfileForm() {
  const { user, refreshUser, setUser } = useAuth();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = profileForm;
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = passwordForm;

  useEffect(() => {
    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
  }, [reset, user]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      return;
    }

    setIsSubmittingProfile(true);

    try {
      const response = await authService.updateProfile(user.id, {
        name: values.name,
        email: values.email,
        phone: values.phone?.trim() ? values.phone.replace(/\D+/g, "") : null,
      });

      setUser({
        ...user,
        ...response.data,
        permissions: user.permissions,
        avatarFallback: user.avatarFallback,
        subunits: response.data.subunits ?? user.subunits,
      });

      await refreshUser();
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmittingProfile(false);
    }
  }

  async function onSubmitPassword(values: ChangePasswordFormValues) {
    setIsSubmittingPassword(true);

    try {
      const response = await authService.changePassword({
        current_password: values.current_password,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      resetPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Dados do perfil</CardTitle>
          <CardDescription>
            Esta tela usa `/auth/me` para leitura e `PUT /users/{'{id}'}` para atualizar seus dados basicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" {...register("email")} />
              {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="Somente numeros ou formatado" {...register("phone")} />
              {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input value={user?.type_label ?? "-"} disabled readOnly />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={user?.status_label ?? "-"} disabled readOnly />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmittingProfile}>
                {isSubmittingProfile ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>
            Informe sua senha atual para definir uma nova senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5 md:grid-cols-2"
            onSubmit={handleSubmitPassword(onSubmitPassword)}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="current_password">Senha atual</Label>
              <Input
                id="current_password"
                type="password"
                autoComplete="current-password"
                {...registerPassword("current_password")}
              />
              {passwordErrors.current_password ? (
                <p className="text-sm text-destructive">
                  {passwordErrors.current_password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...registerPassword("password")}
              />
              {passwordErrors.password ? (
                <p className="text-sm text-destructive">
                  {passwordErrors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar nova senha</Label>
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                {...registerPassword("password_confirmation")}
              />
              {passwordErrors.password_confirmation ? (
                <p className="text-sm text-destructive">
                  {passwordErrors.password_confirmation.message}
                </p>
              ) : null}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmittingPassword}>
                {isSubmittingPassword ? "Alterando..." : "Alterar senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
