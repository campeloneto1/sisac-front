"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePermissionMutation, useUpdatePermissionMutation } from "@/hooks/use-permission-mutations";
import type { CreatePermissionDTO, PermissionItem, UpdatePermissionDTO } from "@/types/permission.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const permissionFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres."),
  slug: z
    .string()
    .min(3, "O slug precisa ter ao menos 3 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/, "Use formato como users.view-any.")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

interface PermissionFormProps {
  mode: "create" | "edit";
  permission?: PermissionItem;
}

function isProtectedPermission(permission: PermissionItem | undefined) {
  return permission ? permission.slug.startsWith("permissions.") : false;
}

export function PermissionForm({ mode, permission }: PermissionFormProps) {
  const router = useRouter();
  const createMutation = useCreatePermissionMutation();
  const updateMutation = useUpdatePermissionMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: permission?.name ?? "",
      slug: permission?.slug ?? "",
      description: permission?.description ?? "",
    },
  });

  useEffect(() => {
    if (!permission) {
      return;
    }

    reset({
      name: permission.name,
      slug: permission.slug,
      description: permission.description ?? "",
    });
  }, [permission, reset]);

  async function onSubmit(values: PermissionFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: values.slug?.trim() ? values.slug : null,
      description: values.description?.trim() ? values.description : null,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreatePermissionDTO);
      router.push(`/permissions/${response.data.id}`);
      return;
    }

    if (!permission) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: permission.id,
      payload: payloadBase satisfies UpdatePermissionDTO,
    });
    router.push(`/permissions/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nova permissao" : "Editar permissao"}</CardTitle>
        <CardDescription>
          Permissoes ficam dentro de Administrador e definem os slugs usados pelo RBAC do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "edit" && isProtectedPermission(permission) ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Permissoes com slug `permissions.*` sao tratadas como protegidas pela policy e exigem tambem a permissao
            global `administrator` para update/delete.
          </div>
        ) : null}

        <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" placeholder="Ex.: users.view-any" {...register("slug")} />
            <p className="text-xs text-slate-500">
              Use o padrao `recurso.acao`. Ex.: `roles.update`, `users.view-any`, `reports.view-any`.
            </p>
            {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" placeholder="Explique o objetivo desta permissao" {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/permissions" : `/permissions/${permission?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar permissao" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

