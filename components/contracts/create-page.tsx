"use client";

import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContractForm } from "@/components/contracts/form";

export function ContractCreatePage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("contracts");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar contratos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O cadastro do contrato exige subunidade ativa para envio do header `X-Active-Subunit`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractForm mode="create" />;
}
