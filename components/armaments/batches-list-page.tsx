"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { ArmamentBatchesPageShell } from "@/components/armaments/batches-page-shell";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentBatchesListPage() {
  const permissions = usePermissions("armaments");

  return (
    <ArmamentBatchesPageShell
      title="Gestao de lotes"
      description="Acompanhe os lotes vinculados a este armamento e sua disponibilidade."
      requiredPermission="view"
    >
      <div className="flex justify-end">
        {permissions.canCreate ? (
          <Button asChild>
            <Link href="./batches/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo lote
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Quantidade total</CardTitle>
            <CardDescription>
              Volume total cadastrado em lotes para este armamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Disponivel</CardTitle>
            <CardDescription>
              Quantidade ainda apta para emprestimo ou consumo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Vencendo / vencidos</CardTitle>
            <CardDescription>
              Lotes que exigem atencao por data de expiracao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Fluxo preparado</CardTitle>
          <CardDescription>
            Esta area ja esta pronta para receber a tabela operacional dos lotes
            quando a API do recurso for publicada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Filtros planejados: lote, disponibilidade, vencendo e vencido.</p>
          <p>
            Acoes planejadas: visualizar, editar, excluir e criar novo lote.
          </p>
          <p>
            O ideal aqui e consumir um endpoint dedicado por armamento ou um
            `armament-batches` com filtro por `armament_id`.
          </p>
        </CardContent>
      </Card>
    </ArmamentBatchesPageShell>
  );
}
