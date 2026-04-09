"use client";

import { useParams } from "next/navigation";

import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import { ArmamentUnitForm } from "@/components/armaments/unit-form";
import { useArmamentUnit } from "@/hooks/use-armament-units";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubunit } from "@/contexts/subunit-context";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentUnitEditPage() {
  const params = useParams<{ id: string; unitId: string }>();
  const permissions = usePermissions("armaments");
  const { activeSubunit } = useSubunit();
  const unitQuery = useArmamentUnit(
    params.id,
    params.unitId,
    Boolean(activeSubunit && permissions.canUpdate),
  );

  return (
    <ArmamentUnitsPageShell
      title="Editar unidade"
      description="Atualize os dados operacionais da unidade vinculada ao armamento."
      requiredPermission="update"
      showIntegrationNotice={false}
    >
      {unitQuery.isLoading ? (
        <Skeleton className="h-[420px] w-full" />
      ) : unitQuery.isError || !unitQuery.data?.data ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Não foi possível carregar a unidade</CardTitle>
            <CardDescription>
              Verifique se a unidade existe e se pertence ao armamento selecionado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ArmamentUnitForm
          armamentId={params.id}
          mode="edit"
          unit={unitQuery.data.data}
        />
      )}
    </ArmamentUnitsPageShell>
  );
}
