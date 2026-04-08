"use client";

import { MaterialUnitsPageShell } from "@/components/materials/units-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialUnitCreatePage() {
  return (
    <MaterialUnitsPageShell
      title="Nova unidade"
      description="Cadastre uma unidade fisica vinculada ao material selecionado."
      requiredPermission="create"
      showIntegrationNotice
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Formulario aguardando endpoints</CardTitle>
          <CardDescription>
            Assim que o backend expuser o CRUD de `MaterialUnit`, esta tela pode receber o formulario completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Campos previstos:</p>
          <p>patrimonio 1 e patrimonio 2;</p>
          <p>data de aquisicao;</p>
          <p>data de expiracao;</p>
          <p>status da unidade.</p>
        </CardContent>
      </Card>
    </MaterialUnitsPageShell>
  );
}
