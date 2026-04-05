"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { LockKeyhole, UserCircle2, Users } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useRole } from "@/hooks/use-roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function isProtectedRole(slug: string) {
  return ["super-admin", "admin"].includes(slug);
}

export function RoleShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("roles");
  const roleQuery = useRole(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `roles.view` para visualizar perfis.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (roleQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (roleQuery.isError || !roleQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar perfil</CardTitle>
          <CardDescription>Os dados do perfil nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const role = roleQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{role.name}</h1>
            {isProtectedRole(role.slug) ? <Badge variant="warning">Role protegida</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">{role.slug}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">{role.description || "Sem descricao cadastrada."}</p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/roles/${role.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos da role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Usuarios vinculados</p>
                <p className="text-sm text-slate-700">{role.users_count ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Permissoes</p>
                <p className="text-sm text-slate-700">{role.permissions_count ?? role.permissions?.length ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {role.creator ? `${role.creator.name} (${role.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Permissoes vinculadas</CardTitle>
            <CardDescription>Lista carregada pelo `RoleResource`.</CardDescription>
          </CardHeader>
          <CardContent>
            {role.permissions?.length ? (
              <div className="grid gap-2 md:grid-cols-2">
                {role.permissions.map((permission) => (
                  <div key={permission.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{permission.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{permission.slug}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Este perfil nao possui permissoes vinculadas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

