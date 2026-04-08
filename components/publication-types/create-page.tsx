"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicationTypeForm } from "@/components/publication-types/form";

export function PublicationTypeCreatePage() {
  const permissions = usePermissions("publication-types");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar tipos de publicação.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PublicationTypeForm mode="create" />;
}
