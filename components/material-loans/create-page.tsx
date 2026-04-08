"use client";

import { Boxes } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { MaterialLoanForm } from "@/components/material-loans/form";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialLoanCreatePage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("material-loans");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar emprestimos de
            materiais.
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
            O cadastro de emprestimos de materiais depende da subunidade ativa.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo emprestimo de material
          </h1>
          <p className="text-sm text-slate-500">
            Registre cautela ou emprestimo temporario com itens por unidade ou
            lote.
          </p>
        </div>
      </div>

      <MaterialLoanForm mode="create" />
    </div>
  );
}
