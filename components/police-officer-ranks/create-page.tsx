"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PoliceOfficerRankForm } from "@/components/police-officer-ranks/form";

interface PoliceOfficerRankCreatePageProps {
  policeOfficers?: Array<{ id: number; name?: string | null; registration_number?: string | null }>;
  ranks?: Array<{ id: number; name: string; abbreviation?: string | null }>;
}

export function PoliceOfficerRankCreatePage({ policeOfficers = [], ranks = [] }: PoliceOfficerRankCreatePageProps) {
  const permissions = usePermissions("police-officer-ranks");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar promoções.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <PoliceOfficerRankForm mode="create" policeOfficers={policeOfficers} ranks={ranks} />;
}
