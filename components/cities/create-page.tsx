"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CityForm } from "@/components/cities/form";

export function CityCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("cities");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `cities.create` para cadastrar cidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CityForm mode="create" />;
}
