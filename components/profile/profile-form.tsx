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

export function ProfileForm() {
  const { user, refreshUser, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

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

    setIsSubmitting(true);

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
      setIsSubmitting(false);
    }
  }

  return (
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

