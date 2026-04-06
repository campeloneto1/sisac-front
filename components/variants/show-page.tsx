"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Boxes, Tag, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useVariant } from "@/hooks/use-variants";
import { getBrandTypeLabel } from "@/types/brand.type";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function typeVariant(type: string | null | undefined) {
  switch (type) {
    case "weapon":
      return "warning";
    case "logistics":
      return "info";
    case "transport":
      return "success";
    default:
      return "outline";
  }
}

export function VariantShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("variants");
  const variantQuery = useVariant(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `variants.view` para visualizar
            modelos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (variantQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (variantQuery.isError || !variantQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar variante</CardTitle>
          <CardDescription>
            Os dados da variante nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const variant = variantQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {variant.name}
            </h1>
            <Badge variant={typeVariant(variant.brand?.type)}>
              {getBrandTypeLabel(variant.brand?.type)}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Sigla: {variant.abbreviation ?? "Nao informada"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Variante associada a uma marca administrativa para reaproveitamento
            em outros modulos.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/variants/${variant.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos da variante.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Marca
                </p>
                <p className="text-sm text-slate-700">
                  {variant.brand?.name ?? "Sem marca vinculada"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Boxes className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Tipo da marca
                </p>
                <p className="text-sm text-slate-700">
                  {getBrandTypeLabel(variant.brand?.type)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {variant.creator
                    ? `${variant.creator.name} (${variant.creator.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Atualizado por
                </p>
                <p className="text-sm text-slate-700">
                  {variant.updater
                    ? `${variant.updater.name} (${variant.updater.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Marca vinculada</CardTitle>
            <CardDescription>
              Contexto carregado pelo `VariantResource`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {variant.brand ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">
                  {variant.brand.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sigla: {variant.brand.abbreviation ?? "Nao informada"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Tipo: {getBrandTypeLabel(variant.brand.type)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Esta variante ainda nao possui marca vinculada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
