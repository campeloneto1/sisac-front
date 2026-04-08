"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import {
  materialOccurrenceStatusOptions,
  materialOccurrenceTypeOptions,
  getMaterialOccurrenceSeverityVariant,
  getMaterialOccurrenceStatusVariant,
} from "@/types/material-occurrence.type";
import { MaterialOccurrencesPageShell } from "@/components/materials/occurrences-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialOccurrencesListPage() {
  const params = useParams<{ id: string }>();

  return (
    <MaterialOccurrencesPageShell
      title="Ocorrencias de materiais"
      description="Centralize extravios, danos, baixas e furtos com trilha operacional e investigativa."
      requiredPermission="view"
      materialId={params.id}
    >
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/materials/${params.id}/occurrences/create`}>
            <Plus className="mr-2 h-4 w-4" />
            Nova ocorrencia
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {materialOccurrenceTypeOptions.map((option) => (
          <Card key={option.value} className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span>{option.label}</span>
                <Badge variant={getMaterialOccurrenceSeverityVariant(option.severity)}>
                  {option.severity}
                </Badge>
              </CardTitle>
              <CardDescription>
                {option.requiresReport
                  ? "Exige controle formal de BO no fluxo ideal."
                  : "Nao exige BO obrigatoriamente no dominio atual."}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Fluxo previsto</CardTitle>
          <CardDescription>
            Esta tela ja esta pronta para receber a listagem operacional assim
            que a API do recurso for publicada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Filtros planejados: tipo, status, periodo, numero do BO e reportado por.
          </p>
          <p>
            Acoes planejadas: visualizar, criar, editar, excluir e navegar para
            a unidade, o lote ou o item de emprestimo relacionado.
          </p>
          <div className="flex flex-wrap gap-2">
            {materialOccurrenceStatusOptions.map((status) => (
              <Badge
                key={status.value}
                variant={getMaterialOccurrenceStatusVariant(status.value)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </MaterialOccurrencesPageShell>
  );
}
