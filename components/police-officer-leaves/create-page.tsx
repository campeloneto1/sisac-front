"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { PoliceOfficerLeaveForm } from "@/components/police-officer-leaves/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PoliceOfficerLeaveCreatePage() {
  const permissions = usePermissions("police-officer-leaves");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar afastamentos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerLeaveForm mode="create" />;
}
