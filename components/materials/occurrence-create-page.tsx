"use client";

import { useParams } from "next/navigation";

import { MaterialOccurrencesPageShell } from "@/components/materials/occurrences-page-shell";
import { materialOccurrenceTypeOptions } from "@/types/material-occurrence.type";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialOccurrenceCreatePage() {
  const params = useParams<{ id: string }>();

  return (
    <MaterialOccurrencesPageShell
      title="Nova ocorrencia de material"
      description="Estruture o fluxo de registro manual para eventos que não nascem automaticamente do empréstimo."
      requiredPermission="create"
      materialId={params.id}
    >
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Formulario preparado</CardTitle>
          <CardDescription>
            Assim que a API existir, esta tela pode receber o cadastro manual de
            ocorrencias como dano, furto ou baixa administrativa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Campos esperados:</p>
          <p>material, unidade ou lote, tipo, data/hora, BO, descrição, status e reportado por.</p>
          <div className="flex flex-wrap gap-2">
            {materialOccurrenceTypeOptions.map((option) => (
              <Badge key={option.value} variant="outline">
                {option.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </MaterialOccurrencesPageShell>
  );
}
