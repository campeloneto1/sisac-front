"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenderForm } from "@/components/genders/form";

export function GenderCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("genders");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `genders.create` para cadastrar gêneros.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <GenderForm mode="create" />;
}
