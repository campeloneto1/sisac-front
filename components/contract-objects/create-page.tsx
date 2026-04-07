"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractObjectForm } from "@/components/contract-objects/form";

export function ContractObjectCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("contract-objects");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `contract-objects.create` para cadastrar objetos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractObjectForm mode="create" />;
}
