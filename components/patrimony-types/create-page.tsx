"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { PatrimonyTypeForm } from "@/components/patrimony-types/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PatrimonyTypeCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("patrimony-types");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `patrimony-types.create` para
            cadastrar tipos de patrimônio.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PatrimonyTypeForm mode="create" />;
}
