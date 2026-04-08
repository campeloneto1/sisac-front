"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BankForm } from "@/components/banks/form";

export function BankCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("banks");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `banks.create` para cadastrar bancos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <BankForm mode="create" />;
}
