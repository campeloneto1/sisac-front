"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useContractFeature } from "@/hooks/use-contract-features";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractFeatureForm } from "@/components/contract-features/form";

export function ContractFeatureEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("contract-features");
  const contractFeatureQuery = useContractFeature(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `contract-features.update` para editar características.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (contractFeatureQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (contractFeatureQuery.isError || !contractFeatureQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar característica</CardTitle>
          <CardDescription>A característica não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ContractFeatureForm mode="edit" contractFeature={contractFeatureQuery.data.data} />;
}
