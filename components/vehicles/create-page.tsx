"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { VehicleForm } from "@/components/vehicles/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VehicleCreatePage() {
  const permissions = usePermissions("vehicles");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `create` para cadastrar veículos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <VehicleForm mode="create" />;
}
