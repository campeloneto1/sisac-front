"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PoliceOfficerVacationForm } from "@/components/police-officer-vacations/form";
import { usePermissions } from "@/hooks/use-permissions";

export function PoliceOfficerVacationCreatePage() {
  const permissions = usePermissions("police-officer-vacations");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `create` para cadastrar ferias.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerVacationForm mode="create" />;
}
