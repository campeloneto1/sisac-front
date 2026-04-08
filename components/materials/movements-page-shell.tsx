"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Boxes, ShieldAlert } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useMaterial } from "@/hooks/use-materials";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialMovementsPageShellProps {
  title: string;
  description: string;
  requiredPermission: "view" | "create" | "update";
  children?: React.ReactNode;
}

export function MaterialMovementsPageShell({
  title,
  description,
  requiredPermission,
  children,
}: MaterialMovementsPageShellProps) {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("materials");
  const materialQuery = useMaterial(
    params.id,
    Boolean(activeSubunit) &&
      (requiredPermission === "view"
        ? permissions.canView
        : requiredPermission === "create"
          ? permissions.canCreate
          : permissions.canUpdate),
  );

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
          <CardDescription>Voce nao possui permissao suficiente para acessar as movimentacoes deste material.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O modulo de materiais depende da subunidade ativa para carregar o contexto operacional.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (materialQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (materialQuery.isError || !materialQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar o material</CardTitle>
          <CardDescription>Verifique se o cadastro existe e se voce possui acesso a ele.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const material = materialQuery.data.data;
  const materialLabel =
    [material.type?.name, material.variant?.name].filter(Boolean).join(" - ") ||
    `Material #${material.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Button asChild type="button" variant="outline">
            <Link href={`/materials/${material.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao material
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Boxes className="h-4 w-4 text-primary" />
            Material base
          </div>
          <p className="text-sm font-semibold text-slate-900">{materialLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            {material.subunit?.abbreviation || material.subunit?.name || activeSubunit.name}
          </p>
        </div>
      </div>

      <Card className="border-amber-200/80 bg-amber-50/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <ShieldAlert className="h-5 w-5" />
            Integracao pendente com a API
          </CardTitle>
          <CardDescription className="text-amber-800">
            A estrutura de navegacao e consulta das movimentacoes foi preparada dentro do CRUD de materiais, mas o backend ainda nao expoe endpoints dedicados para `MaterialMovement`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-900">
          <p>Assim que a API publicar o recurso, esta tela pode receber:</p>
          <p>historico por tipo, data, unidade e lote;</p>
          <p>detalhe do movimento com referencia de origem;</p>
          <p>indicadores de impacto no estoque e auditoria operacional.</p>
        </CardContent>
      </Card>

      {children}
    </div>
  );
}
