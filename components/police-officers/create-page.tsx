"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PoliceOfficerForm } from "@/components/police-officers/form";

export function PoliceOfficerCreatePage() {
  const permissions = usePermissions("police-officers");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `create` para cadastrar policiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerForm mode="create" />;
}
