"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandForm } from "@/components/brands/form";

export function BrandCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("brands");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `brands.create` para cadastrar marcas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <BrandForm mode="create" />;
}
