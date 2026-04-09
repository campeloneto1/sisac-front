"use client";

import { useParams } from "next/navigation";

import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import { ArmamentUnitForm } from "@/components/armaments/unit-form";

export function ArmamentUnitCreatePage() {
  const params = useParams<{ id: string }>();

  return (
    <ArmamentUnitsPageShell
      title="Nova unidade"
      description="Cadastre uma unidade fisica vinculada ao armamento selecionado."
      requiredPermission="create"
      showIntegrationNotice={false}
    >
      <ArmamentUnitForm armamentId={params.id} mode="create" />
    </ArmamentUnitsPageShell>
  );
}
