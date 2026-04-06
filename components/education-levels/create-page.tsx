"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EducationLevelForm } from "@/components/education-levels/form";

export function EducationLevelCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("education-levels");

  if (!hasPermission(user, "administrator") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `education-levels.create` para cadastrar niveis de escolaridade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <EducationLevelForm mode="create" />;
}
