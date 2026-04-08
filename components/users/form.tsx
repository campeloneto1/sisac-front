"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateUserMutation, useUpdateUserMutation } from "@/hooks/use-user-mutations";
import { useRoles } from "@/hooks/use-users";
import type { CreateUserDTO, UpdateUserDTO, UserListItem } from "@/types/user.type";
import { userStatusOptions, userTypeOptions } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const userFormSchema = z
  .object({
    name: z.string().min(3, "O nome precisa ter ao menos 3 caracteres."),
    document: z.string().min(11, "Informe 11 dígitos.").max(14, "Documento invalido."),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().optional(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    type: z.string().min(1, "Selecione o tipo."),
    status: z.string().optional(),
    authorized_until: z.string().optional(),
    role_id: z.string().min(1, "Selecione o perfil."),
  })
  .superRefine((data, context) => {
    if (!data.password && !data.password_confirmation) {
      return;
    }

    if ((data.password?.length ?? 0) < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "A senha precisa ter ao menos 8 caracteres.",
      });
    }

    if (data.password !== data.password_confirmation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password_confirmation"],
        message: "A confirmacao precisa ser igual a senha.",
      });
    }
  });

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  mode: "create" | "edit";
  user?: UserListItem;
}

export function UserForm({ mode, user }: UserFormProps) {
  const router = useRouter();
  const rolesQuery = useRoles();
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      document: user?.document ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      password_confirmation: "",
      type: user?.type ?? "",
      status: user?.status ?? "",
      authorized_until: user?.authorized_until?.slice(0, 10) ?? "",
      role_id: user?.role?.id ? String(user.role.id) : "",
    },
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      name: user.name ?? "",
      document: user.document ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      password: "",
      password_confirmation: "",
      type: user.type ?? "",
      status: user.status ?? "",
      authorized_until: user.authorized_until?.slice(0, 10) ?? "",
      role_id: user.role?.id ? String(user.role.id) : "",
    });
  }, [reset, user]);

  const selectedType = useWatch({
    control,
    name: "type",
  });
  const selectedRoleId = useWatch({
    control,
    name: "role_id",
  });
  const selectedStatus = useWatch({
    control,
    name: "status",
  });

  async function onSubmit(values: UserFormValues) {
    const basePayload = {
      name: values.name.trim(),
      document: values.document.replace(/\D+/g, ""),
      email: values.email.trim().toLowerCase(),
      phone: values.phone?.trim() ? values.phone.replace(/\D+/g, "") : null,
      type: values.type,
      status: values.status?.trim() ? values.status : null,
      authorized_until: values.authorized_until?.trim() ? values.authorized_until : null,
      role_id: Number(values.role_id),
    };

    if (mode === "create") {
      if (!values.password?.trim()) {
        setError("password", {
          type: "manual",
          message: "A senha e obrigatória no cadastro.",
        });
        return;
      }

      if (!values.password_confirmation?.trim()) {
        setError("password_confirmation", {
          type: "manual",
          message: "Confirme a senha para continuar.",
        });
        return;
      }

      const payload: CreateUserDTO = {
        ...basePayload,
        password: values.password ?? "",
        password_confirmation: values.password_confirmation ?? "",
      };

      const response = await createMutation.mutateAsync(payload);
      router.push(`/users/${response.data.id}`);
      return;
    }

    if (!user) {
      return;
    }

    const payload: UpdateUserDTO = {
      ...basePayload,
    };

    if (values.password?.trim()) {
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    const response = await updateMutation.mutateAsync({
      id: user.id,
      payload,
    });
    router.push(`/users/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo usuário" : "Editar usuário"}</CardTitle>
        <CardDescription>
          Formulario alinhado com o `StoreUserRequest` e `UpdateUserRequest` do backend.
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
            <Label htmlFor="document">Documento</Label>
            <Input id="document" placeholder="Somente numeros" {...register("document")} />
            {errors.document ? <p className="text-sm text-destructive">{errors.document.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="Somente numeros" {...register("phone")} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select
              value={selectedRoleId || undefined}
              onValueChange={(value) => setValue("role_id", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={rolesQuery.isLoading ? "Carregando perfis..." : "Selecione um perfil"} />
              </SelectTrigger>
              <SelectContent>
                {(rolesQuery.data?.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id ? <p className="text-sm text-destructive">{errors.role_id.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={selectedType || undefined} onValueChange={(value) => setValue("type", value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={selectedStatus || "none"}
              onValueChange={(value) => setValue("status", value === "none" ? "" : value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informar</SelectItem>
                {userStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorized_until">Autorizado ate</Label>
            <Input
              id="authorized_until"
              type="date"
              disabled={selectedType !== "external"}
              {...register("authorized_until")}
            />
            <p className="text-xs text-slate-500">
              Campo relevante principalmente para usuários externos temporariamente autorizados.
            </p>
            {errors.authorized_until ? (
              <p className="text-sm text-destructive">{errors.authorized_until.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{mode === "create" ? "Senha" : "Nova senha"}</Label>
            <Input id="password" type="password" {...register("password")} />
            {mode === "edit" ? (
              <p className="text-xs text-slate-500">Deixe em branco para manter a senha atual.</p>
            ) : null}
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirmar senha</Label>
            <Input id="password_confirmation" type="password" {...register("password_confirmation")} />
            {errors.password_confirmation ? (
              <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>
            ) : null}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/users" : `/users/${user?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar usuário" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
