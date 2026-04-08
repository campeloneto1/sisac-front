"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

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
  const [highlightedAvailableIds, setHighlightedAvailableIds] = useState<number[]>([]);
  const [highlightedSelectedIds, setHighlightedSelectedIds] = useState<number[]>([]);
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

  const availablePermissions = useMemo(
    () => filteredPermissions.filter((permission) => !selectedPermissionIds.includes(permission.id)),
    [filteredPermissions, selectedPermissionIds],
  );

  const selectedPermissions = useMemo(
    () =>
      filteredPermissions
        .filter((permission) => selectedPermissionIds.includes(permission.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [filteredPermissions, selectedPermissionIds],
  );

  function toggleHighlightedId(id: number, side: "available" | "selected") {
    const setter = side === "available" ? setHighlightedAvailableIds : setHighlightedSelectedIds;

    setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function moveToSelected() {
    if (!highlightedAvailableIds.length) {
      return;
    }

    setSelectedPermissionIds((current) => Array.from(new Set([...current, ...highlightedAvailableIds])));
    setHighlightedAvailableIds([]);
  }

  function moveToAvailable() {
    if (!highlightedSelectedIds.length) {
      return;
    }

    setSelectedPermissionIds((current) => current.filter((id) => !highlightedSelectedIds.includes(id)));
    setHighlightedSelectedIds([]);
  }

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
            Esta role e protegida pela policy. Alteracoes em `admin` ou `super-admin` dependem também da permissão global
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
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Descreva a finalidade do perfil" {...register("description")} />
              {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4">
            <div className="space-y-1">
              <Label>Permissões</Label>
              <p className="text-sm text-slate-500">
                Selecione as permissões que serao sincronizadas com a role.
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar permissão por nome ou slug"
                value={permissionSearch}
                onChange={(event) => setPermissionSearch(event.target.value)}
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Disponíveis</p>
                  <span className="text-xs text-slate-500">{availablePermissions.length}</span>
                </div>
                <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
                  {permissionsQuery.isLoading ? (
                    <p className="text-sm text-slate-500">Carregando permissões...</p>
                  ) : availablePermissions.length ? (
                    availablePermissions.map((permission) => {
                      const active = highlightedAvailableIds.includes(permission.id);

                      return (
                        <button
                          key={permission.id}
                          type="button"
                          onClick={() => toggleHighlightedId(permission.id, "available")}
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-primary bg-secondary text-slate-900"
                              : "border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-sm font-medium">{permission.name}</p>
                          <p className="text-xs text-slate-500">{permission.slug}</p>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">Nenhuma permissão disponível.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row items-center justify-center gap-2 lg:flex-col">
                <Button type="button" variant="outline" size="icon" onClick={moveToSelected} disabled={!highlightedAvailableIds.length}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={moveToAvailable} disabled={!highlightedSelectedIds.length}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Selecionadas</p>
                  <span className="text-xs text-slate-500">{selectedPermissionIds.length}</span>
                </div>
                <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3">
                  {selectedPermissions.length ? (
                    selectedPermissions.map((permission) => {
                      const active = highlightedSelectedIds.includes(permission.id);

                      return (
                        <button
                          key={permission.id}
                          type="button"
                          onClick={() => toggleHighlightedId(permission.id, "selected")}
                          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-primary bg-secondary text-slate-900"
                              : "border-transparent hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-sm font-medium">{permission.name}</p>
                          <p className="text-xs text-slate-500">{permission.slug}</p>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">Nenhuma permissão selecionada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={mode === "create" ? "/roles" : `/roles/${role?.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : mode === "create" ? "Criar perfil" : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
