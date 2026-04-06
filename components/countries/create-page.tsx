"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CountryForm } from "@/components/countries/form";

export function CountryCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("countries");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `countries.create` para cadastrar paises.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CountryForm mode="create" />;
}
