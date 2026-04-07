"use client";

import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentUnitCreatePage() {
  return (
    <ArmamentUnitsPageShell
      title="Nova unidade"
      description="Cadastre uma unidade fisica vinculada ao armamento selecionado."
      requiredPermission="create"
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Formulario aguardando endpoints</CardTitle>
          <CardDescription>
            Assim que o backend expuser o CRUD de `ArmamentUnit`, esta tela pode
            receber o formulario completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Campos previstos:</p>
          <p>serial number;</p>
          <p>data de aquisicao;</p>
          <p>data de expiracao;</p>
          <p>status da unidade.</p>
        </CardContent>
      </Card>
    </ArmamentUnitsPageShell>
  );
}
