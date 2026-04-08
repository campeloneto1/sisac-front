"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { ColorForm } from "@/components/colors/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ColorCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("colors");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `colors.create` para cadastrar
            cores.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ColorForm mode="create" />;
}
