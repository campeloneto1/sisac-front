"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MaterialOccurrencesPageShellProps {
  title: string;
  description: string;
  requiredPermission: "view" | "create" | "update";
  materialId: string;
  children?: React.ReactNode;
}

export function MaterialOccurrencesPageShell({
  title,
  description,
  requiredPermission,
  materialId,
  children,
}: MaterialOccurrencesPageShellProps) {
  const permissions = usePermissions("materials");
  const hasPermission =
    requiredPermission === "view"
      ? permissions.canView
      : requiredPermission === "create"
        ? permissions.canCreate
        : permissions.canUpdate;

  if (!hasPermission) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce nao possui permissao suficiente para acessar ocorrencias de
            materiais.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Button asChild type="button" variant="outline">
            <Link href={`/materials/${materialId}`}>
              Voltar ao material
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-amber-200/80 bg-amber-50/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <ShieldAlert className="h-5 w-5" />
            Integracao pendente com a API
          </CardTitle>
          <CardDescription className="text-amber-800">
            A navegacao do modulo foi preparada, mas o backend ainda nao expoe
            endpoints REST dedicados para `MaterialOccurrence`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p>Para fechar o CRUD real, a API ainda precisa publicar:</p>
          <p>controller, service, repository, request, resource e policy;</p>
          <p>rotas REST para listar, criar, visualizar, editar e excluir;</p>
          <p>payload com tipo, status, severidade, material, unidade/lote e reportante.</p>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
