"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { ArmamentUnitsPageShell } from "@/components/armaments/units-page-shell";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ArmamentUnitsListPage() {
  const permissions = usePermissions("armaments");

  return (
    <ArmamentUnitsPageShell
      title="Gestão de unidades"
      description="Acompanhe e organize as unidades fisicas vinculadas a este armamento."
      requiredPermission="view"
    >
      <div className="flex justify-end">
        {permissions.canCreate ? (
          <Button asChild>
            <Link href="./units/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova unidade
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Disponíveis</CardTitle>
            <CardDescription>
              Quantidade de unidades aptas para uso operacional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Com vencimento</CardTitle>
            <CardDescription>
              Unidades que exigem acompanhamento de prazo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display text-slate-900">--</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Indisponiveis</CardTitle>
            <CardDescription>
              Emprestadas, cedidas, em manutenção, baixadas ou extraviadas.
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
            Esta area já esta pronta para receber a tabela operacional das
            unidades quando a API do recurso for publicada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Filtros planejados: serial number, status, vencido e vencendo.</p>
          <p>
            Ações planejadas: visualizar, editar, excluir e criar nova unidade.
          </p>
          <p>
            O ideal aqui e consumir um endpoint dedicado por armamento ou um
            `armament-units` com filtro por `armament_id`.
          </p>
        </CardContent>
      </Card>
    </ArmamentUnitsPageShell>
  );
}
