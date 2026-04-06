"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RankForm } from "@/components/ranks/form";

export function RankCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("ranks");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `ranks.create` para cadastrar postos/graduações.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <RankForm mode="create" />;
}
