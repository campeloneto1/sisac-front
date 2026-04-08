"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { usePermissionItem } from "@/hooks/use-permission-resources";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionForm } from "@/components/permissions/form";

export function PermissionEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("permissions");
  const permissionQuery = usePermissionItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `permissions.update` para editar permissões.</CardDescription>
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
          <CardDescription>A permissão não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PermissionForm mode="edit" permission={permissionQuery.data.data} />;
}

