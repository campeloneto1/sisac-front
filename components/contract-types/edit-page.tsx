"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useContractType } from "@/hooks/use-contract-types";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractTypeForm } from "@/components/contract-types/form";

export function ContractTypeEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contract-types");
  const contractTypeQuery = useContractType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `contract-types.update` para editar tipos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractTypeQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (contractTypeQuery.isError || !contractTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de contrato</CardTitle>
          <CardDescription>O tipo de contrato nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractTypeForm mode="edit" contractType={contractTypeQuery.data.data} />;
}
