"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useRank } from "@/hooks/use-ranks";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RankForm } from "@/components/ranks/form";

export function RankEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("ranks");
  const rankQuery = useRank(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `ranks.update` para editar postos/graduações.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (rankQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (rankQuery.isError || !rankQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar posto/graduação</CardTitle>
          <CardDescription>O posto/graduação não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <RankForm mode="edit" rank={rankQuery.data.data} />;
}
