"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { KeyRound, ShieldCheck, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { usePermissionItem } from "@/hooks/use-permission-resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function isProtectedPermission(slug: string) {
  return slug.startsWith("permissions.");
}

export function PermissionShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("permissions");
  const permissionQuery = usePermissionItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `permissions.view` para visualizar permissões.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (permissionQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (permissionQuery.isError || !permissionQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar permissão</CardTitle>
          <CardDescription>Os dados da permissão não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const permission = permissionQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{permission.name}</h1>
            {isProtectedPermission(permission.slug) ? <Badge variant="warning">Permissão protegida</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">{permission.slug}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">{permission.description || "Sem descrição cadastrada."}</p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/permissions/${permission.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos da permissão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Roles vinculadas</p>
                <p className="text-sm text-slate-700">{permission.roles_count ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {permission.creator ? `${permission.creator.name} (${permission.creator.email})` : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {permission.updater ? `${permission.updater.name} (${permission.updater.email})` : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Roles vinculadas</CardTitle>
            <CardDescription>Lista carregada pelo `PermissionResource`.</CardDescription>
          </CardHeader>
          <CardContent>
            {permission.roles?.length ? (
              <div className="grid gap-2 md:grid-cols-2">
                {permission.roles.map((role) => (
                  <div key={role.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{role.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{role.slug}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <KeyRound className="h-4 w-4 text-primary" />
                <p className="text-sm text-slate-500">Esta permissão ainda não esta vinculada a nenhuma role.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

