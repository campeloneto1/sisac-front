"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractFeatureForm } from "@/components/contract-features/form";

export function ContractFeatureCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("contract-features");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `contract-features.create` para cadastrar características.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractFeatureForm mode="create" />;
}
