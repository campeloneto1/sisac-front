"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/users/form";

export function UserCreatePage() {
  const permissions = usePermissions("users");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar usuários.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <UserForm mode="create" />;
}

