"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useContractObject } from "@/hooks/use-contract-objects";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractObjectForm } from "@/components/contract-objects/form";

export function ContractObjectEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contract-objects");
  const contractObjectQuery = useContractObject(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `contract-objects.update` para editar objetos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractObjectQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (contractObjectQuery.isError || !contractObjectQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar objeto de contrato</CardTitle>
          <CardDescription>O objeto de contrato nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractObjectForm mode="edit" contractObject={contractObjectQuery.data.data} />;
}
