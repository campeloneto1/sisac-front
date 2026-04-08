"use client";

import { Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { WorkshopForm } from "@/components/workshops/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkshopCreatePage() {
  const { user } = useAuth();
  const permissions = usePermissions("workshops");

  if (!hasPermission(user, "manager") || !permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `manager` e `workshops.create` para cadastrar
            oficinas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">Nova oficina</h1>
          <p className="text-sm text-slate-500">
            Registre uma nova oficina para uso em fluxos de manutenção.
          </p>
        </div>
      </div>

      <WorkshopForm mode="create" />
    </div>
  );
}
