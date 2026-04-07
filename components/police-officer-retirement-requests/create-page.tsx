"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { PoliceOfficerRetirementRequestForm } from "@/components/police-officer-retirement-requests/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PoliceOfficerRetirementRequestCreatePage() {
  const permissions = usePermissions("police-officer-retirement-requests");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar requerimentos de
            aposentadoria.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerRetirementRequestForm mode="create" />;
}
