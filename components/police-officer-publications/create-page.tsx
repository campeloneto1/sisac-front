"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { PoliceOfficerPublicationForm } from "@/components/police-officer-publications/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PoliceOfficerPublicationCreatePage() {
  const permissions = usePermissions("police-officer-publications");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar publicações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerPublicationForm mode="create" />;
}
