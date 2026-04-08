"use client";

import { Landmark } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { PatrimonyForm } from "@/components/patrimonies/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PatrimonyCreatePage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar patrimonios.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>
            O cadastro de patrimonios depende da subunidade ativa.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo patrimonio
          </h1>
          <p className="text-sm text-slate-500">
            Registre um novo bem patrimonial para a subunidade ativa.
          </p>
        </div>
      </div>

      <PatrimonyForm mode="create" />
    </div>
  );
}
