"use client";

import { useParams } from "next/navigation";

import { useSubunit } from "@/contexts/subunit-context";
import { useContract } from "@/hooks/use-contracts";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractForm } from "@/components/contracts/form";

export function ContractEditPage() {
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contracts");
  const contractQuery = useContract(params.id, Boolean(activeSubunit));

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar contratos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>A edição do contrato depende do contexto ativo da subunidade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (contractQuery.isError || !contractQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar contrato</CardTitle>
          <CardDescription>O contrato não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractForm mode="edit" contract={contractQuery.data.data} />;
}
