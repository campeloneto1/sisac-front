"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { VehicleTypeForm } from "@/components/vehicle-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VehicleTypeCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("vehicle-types");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `vehicle-types.create` para
            cadastrar tipos de veiculo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <VehicleTypeForm mode="create" />;
}
