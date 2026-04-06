"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubunitForm } from "@/components/subunits/form";

export function SubunitCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("subunits");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `subunits.create` para cadastrar subunidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <SubunitForm mode="create" />;
}
