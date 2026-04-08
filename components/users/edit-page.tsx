"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useUser } from "@/hooks/use-users";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "@/components/users/form";

export function UserEditPage() {
  const params = useParams<{ id: string }>();
  const { user: authenticatedUser } = useAuth();
  const permissions = usePermissions("users");
  const userQuery = useUser(params.id);
  const isSelf = authenticatedUser?.id === Number(params.id);

  if (!permissions.canUpdate && !isSelf) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar este usuário.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (userQuery.isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar usuário</CardTitle>
          <CardDescription>Verifique se o registro existe e se você tem acesso.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <UserForm mode="edit" user={userQuery.data.data} />;
}

