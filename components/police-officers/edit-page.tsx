"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficer } from "@/hooks/use-police-officers";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerForm } from "@/components/police-officers/form";
import { ProfilePhotoSection } from "@/components/police-officers/profile-photo-section";

export function PoliceOfficerEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officers");
  const policeOfficerQuery = usePoliceOfficer(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar policiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerQuery.isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  if (policeOfficerQuery.isError || !policeOfficerQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar policial</CardTitle>
          <CardDescription>O policial não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ProfilePhotoSection policeOfficer={policeOfficerQuery.data.data} />
      <PoliceOfficerForm mode="edit" policeOfficer={policeOfficerQuery.data.data} />
    </div>
  );
}
