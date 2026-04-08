"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import {
  armamentOccurrenceStatusOptions,
  armamentOccurrenceTypeOptions,
  getArmamentOccurrenceSeverityVariant,
  getArmamentOccurrenceStatusVariant,
} from "@/types/armament-occurrence.type";
import { ArmamentOccurrencesPageShell } from "@/components/armament-occurrences/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentOccurrencesListPage() {
  return (
    <ArmamentOccurrencesPageShell
      title="Ocorrencias de armamentos"
      description="Centralize extravios, danos, baixas e furtos com trilha operacional e investigativa."
      requiredPermission="viewAny"
    >
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/armament-occurrences/create">
            <Plus className="mr-2 h-4 w-4" />
            Nova ocorrencia
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {armamentOccurrenceTypeOptions.map((option) => (
          <Card key={option.value} className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span>{option.label}</span>
                <Badge variant={getArmamentOccurrenceSeverityVariant(option.severity)}>
                  {option.severity}
                </Badge>
              </CardTitle>
              <CardDescription>
                {option.requiresReport
                  ? "Exige controle formal de BO no fluxo ideal."
                  : "Não exige BO obrigatoriamente no dominio atual."}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Fluxo previsto</CardTitle>
          <CardDescription>
            Esta tela já esta pronta para receber a listagem operacional assim
            que a API do recurso for publicada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Filtros planejados: tipo, status, armamento, período, número do BO e
            reportado por.
          </p>
          <p>
            Ações planejadas: visualizar, criar, editar, excluir e navegar para
            o armamento relacionado.
          </p>
          <div className="flex flex-wrap gap-2">
            {armamentOccurrenceStatusOptions.map((status) => (
              <Badge
                key={status.value}
                variant={getArmamentOccurrenceStatusVariant(status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </ArmamentOccurrencesPageShell>
  );
}
