"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VariantForm } from "@/components/variants/form";

export function VariantCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("variants");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `variants.create` para cadastrar variantes.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <VariantForm mode="create" />;
}
