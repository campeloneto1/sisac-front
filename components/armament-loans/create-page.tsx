"use client";

import { Crosshair } from "lucide-react";

import { ArmamentLoanForm } from "@/components/armament-loans/form";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentLoanCreatePage() {
  const permissions = usePermissions("armament-loans");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `create` para cadastrar emprestimos de
            armamentos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Crosshair className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Novo emprestimo de armamento
          </h1>
          <p className="text-sm text-slate-500">
            Registre cautela ou emprestimo temporario com itens por unidade ou
            lote.
          </p>
        </div>
      </div>

      <ArmamentLoanForm mode="create" />
    </div>
  );
}
