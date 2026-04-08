"use client";

import { MaterialMovementsPageShell } from "@/components/materials/movements-page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaterialMovementsListPage() {
  return (
    <MaterialMovementsPageShell
      title="Movimentacoes"
      description="Consulte o histórico operacional deste material."
      requiredPermission="view"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Entradas</CardTitle>
            <CardDescription>Movimentos que aumentam o estoque do material.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Saidas</CardTitle>
            <CardDescription>Empréstimos, cessoes, baixas e outras reducoes de estoque.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Ajustes / eventos</CardTitle>
            <CardDescription>Devolucoes, ajustes, extravios e demais ocorrencias.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Fluxo preparado</CardTitle>
          <CardDescription>Esta area já esta pronta para receber a tabela historica de movimentacoes quando a API do recurso for publicada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Filtros planejados: tipo, período, unidade, lote e referência.</p>
          <p>Ações planejadas: visualizar movimento e navegar para a origem do evento.</p>
          <p>O ideal aqui e expor um endpoint `material-movements` com filtro por `material_id` e suporte a relacoes de referência.</p>
        </CardContent>
      </Card>
    </MaterialMovementsPageShell>
  );
}
