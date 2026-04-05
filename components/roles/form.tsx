"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";

import { usePermissionOptions } from "@/hooks/use-roles";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/hooks/use-role-mutations";
import type { CreateRoleDTO, RoleItem, UpdateRoleDTO } from "@/types/role.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const roleFormSchema = z.object({
  name: z.string().min(2, "O nome precisa ter ao menos 2 caracteres."),
  slug: z.string().optional(),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  mode: "create" | "edit";
  role?: RoleItem;
}

function isProtectedRole(role: RoleItem | undefined) {
  return role ? ["super-admin", "admin"].includes(role.slug) : false;
}

export function RoleForm({ mode, role }: RoleFormProps) {
  const router = useRouter();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const permissionsQuery = usePermissionOptions();
  const [permissionSearch, setPermissionSearch] = useState("");
  const initialPermissionIds = useMemo(() => role?.permissions?.map((item) => item.id) ?? [], [role?.permissions]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(initialPermissionIds);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? "",
      slug: role?.slug ?? "",
      description: role?.description ?? "",
    },
  });

  useEffect(() => {
    if (!role) {
      return;
    }

    reset({
      name: role.name,
      slug: role.slug,
      description: role.description ?? "",
    });
  }, [reset, role]);

  const filteredPermissions = useMemo(() => {
    const items = permissionsQuery.data?.data ?? [];

    if (!permissionSearch.trim()) {
      return items;
    }

    const normalizedSearch = permissionSearch.trim().toLowerCase();
    return items.filter((permission) => {
      return (
        permission.name.toLowerCase().includes(normalizedSearch) ||
        permission.slug.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [permissionSearch, permissionsQuery.data?.data]);

  async function onSubmit(values: RoleFormValues) {
    const payloadBase = {
      name: values.name.trim(),
      slug: values.slug?.trim() ? values.slug : null,
      description: values.description?.trim() ? values.description : null,
      permission_ids: selectedPermissionIds,
    };

    if (mode === "create") {
      const response = await createMutation.mutateAsync(payloadBase satisfies CreateRoleDTO);
      router.push(`/roles/${response.data.id}`);
      return;
    }

    if (!role) {
      return;
    }

    const response = await updateMutation.mutateAsync({
      id: role.id,
      payload: payloadBase satisfies UpdateRoleDTO,
    });
    router.push(`/roles/${response.data.id}`);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Novo perfil" : "Editar perfil"}</CardTitle>
        <CardDescription>
          Perfis ficam dentro do menu Administrador e sincronizam `permission_ids` com a API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "edit" && isProtectedRole(role) ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Esta role e protegida pela policy. Alteracoes em `admin` ou `super-admin` dependem tambem da permissao global
            `administrator`.
          </div>
        ) : null}

        <form className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="Deixe vazio para gerar automaticamente" {...register("slug")} />
              {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea id="description" placeholder="Descreva a finalidade do perfil" {...register("description")} />
              {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4">
            <div className="space-y-1">
              <Label>Permissoes</Label>
              <p className="text-sm text-slate-500">
                Selecione as permissoes que serao sincronizadas com a role.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar permissao por nome ou slug"
                value={permissionSearch}
                onChange={(event) => setPermissionSearch(event.target.value)}
              />
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
              {permissionsQuery.isLoading ? (
                <p className="text-sm text-slate-500">Carregando permissoes...</p>
              ) : filteredPermissions.length ? (
                filteredPermissions.map((permission) => {
                  const checked = selectedPermissionIds.includes(permission.id);

                  return (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                        checked={checked}
                        onChange={(event) => {
                          setSelectedPermissionIds((current) => {
                            if (event.target.checked) {
                              return [...current, permission.id];
                            }

                            return current.filter((id) => id !== permission.id);
                          });
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                        <p className="text-xs text-slate-500">{permission.slug}</p>
                      </div>
                    </label>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">Nenhuma permissao encontrada.</p>
              )}
            </div>
          </div>

          <div className="xl:col-span-2 flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/roles" : `/roles/${role?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar perfil" : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
