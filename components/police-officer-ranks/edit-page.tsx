"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRank } from "@/hooks/use-police-officer-ranks";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerRankForm } from "@/components/police-officer-ranks/form";

interface PoliceOfficerRankEditPageProps {
  policeOfficers?: Array<{ id: number; name?: string | null; registration_number?: string | null }>;
  ranks?: Array<{ id: number; name: string; abbreviation?: string | null }>;
}

export function PoliceOfficerRankEditPage({ policeOfficers = [], ranks = [] }: PoliceOfficerRankEditPageProps) {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-ranks");
  const policeOfficerRankQuery = usePoliceOfficerRank(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar promoções.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerRankQuery.isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (policeOfficerRankQuery.isError || !policeOfficerRankQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar promoção</CardTitle>
          <CardDescription>A promoção não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PoliceOfficerRankForm
      mode="edit"
      policeOfficerRank={policeOfficerRankQuery.data.data}
      policeOfficers={policeOfficers}
      ranks={ranks}
    />
  );
}
