"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyForm } from "@/components/companies/form";

export function CompanyCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("companies");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `companies.create` para cadastrar empresas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CompanyForm mode="create" />;
}
