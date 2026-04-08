"use client";

import {
  armamentOccurrenceTypeOptions,
} from "@/types/armament-occurrence.type";
import { ArmamentOccurrencesPageShell } from "@/components/armament-occurrences/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentOccurrenceCreatePage() {
  return (
    <ArmamentOccurrencesPageShell
      title="Nova ocorrencia de armamento"
      description="Estruture o fluxo de registro manual para eventos que não nascem automaticamente do empréstimo."
      requiredPermission="create"
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
          <p>armamento, unidade ou lote, tipo, data/hora, BO, descrição, status e reportado por.</p>
          <div className="flex flex-wrap gap-2">
            {armamentOccurrenceTypeOptions.map((option) => (
              <Badge key={option.value} variant="outline">
                {option.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </ArmamentOccurrencesPageShell>
  );
}
