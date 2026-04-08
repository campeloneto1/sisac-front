"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { LeaveTypeForm } from "@/components/leave-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LeaveTypeCreatePage() {
  const permissions = usePermissions("leave-types");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar tipos de afastamento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <LeaveTypeForm mode="create" />;
}
