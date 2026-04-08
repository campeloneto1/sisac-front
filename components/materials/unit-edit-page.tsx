"use client";

import { useParams } from "next/navigation";

import { MaterialUnitsPageShell } from "@/components/materials/units-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialUnitEditPage() {
  const params = useParams<{ unitId: string }>();

  return (
    <MaterialUnitsPageShell
      title="Editar unidade"
      description="Atualize os dados operacionais da unidade vinculada ao material."
      requiredPermission="update"
      showIntegrationNotice
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Edição da unidade #{params.unitId}</CardTitle>
          <CardDescription>
            Esta tela fica reservada para o formulario de edição quando o recurso estiver disponível na API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Atualizacoes previstas:</p>
          <p>patrimônios;</p>
          <p>datas de aquisicao e expiracao;</p>
          <p>mudança controlada de status.</p>
        </CardContent>
      </Card>
    </MaterialUnitsPageShell>
  );
}
