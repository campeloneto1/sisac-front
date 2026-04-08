"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useRole } from "@/hooks/use-roles";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleForm } from "@/components/roles/form";

export function RoleEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("roles");
  const roleQuery = useRole(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `roles.update` para editar perfis.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (roleQuery.isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  if (roleQuery.isError || !roleQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar perfil</CardTitle>
          <CardDescription>O perfil não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <RoleForm mode="edit" role={roleQuery.data.data} />;
}

