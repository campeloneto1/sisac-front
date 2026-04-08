"use client";

import { useParams } from "next/navigation";

import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentUnitEditPage() {
  const params = useParams<{ unitId: string }>();

  return (
    <ArmamentUnitsPageShell
      title="Editar unidade"
      description="Atualize os dados operacionais da unidade vinculada ao armamento."
      requiredPermission="update"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Edição da unidade #{params.unitId}</CardTitle>
          <CardDescription>
            Esta tela fica reservada para o formulario de edição quando o
            recurso estiver disponível na API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Atualizacoes previstas:</p>
          <p>serial number;</p>
          <p>datas de aquisicao e expiracao;</p>
          <p>mudança controlada de status.</p>
        </CardContent>
      </Card>
    </ArmamentUnitsPageShell>
  );
}
