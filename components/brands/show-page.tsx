"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Boxes, ShieldCheck, Tag, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useBrand } from "@/hooks/use-brands";
import { getBrandTypeLabel } from "@/types/brand.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function typeVariant(type: string) {
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

export function BrandShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("brands");
  const brandQuery = useBrand(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `brands.view` para visualizar marcas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (brandQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (brandQuery.isError || !brandQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar marca</CardTitle>
          <CardDescription>Os dados da marca nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const brand = brandQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{brand.name}</h1>
            <Badge variant={typeVariant(brand.type)}>{getBrandTypeLabel(brand.type)}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">Sigla: {brand.abbreviation ?? "Nao informada"}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Esta marca pode alimentar variantes e outros catalogos relacionados ao tipo selecionado.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/brands/${brand.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos da marca.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tipo</p>
                <p className="text-sm text-slate-700">{getBrandTypeLabel(brand.type)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Boxes className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Variantes vinculadas</p>
                <p className="text-sm text-slate-700">{brand.variants_count ?? brand.variants?.length ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {brand.creator ? `${brand.creator.name} (${brand.creator.email})` : "Nao informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {brand.updater ? `${brand.updater.name} (${brand.updater.email})` : "Nao informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Variantes vinculadas</CardTitle>
            <CardDescription>Lista carregada pelo `BrandResource` no endpoint de detalhes.</CardDescription>
          </CardHeader>
          <CardContent>
            {brand.variants?.length ? (
              <div className="grid gap-2 md:grid-cols-2">
                {brand.variants.map((variant) => (
                  <div key={variant.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{variant.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Sigla: {variant.abbreviation ?? "Nao informada"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm text-slate-500">Esta marca ainda nao possui variantes vinculadas.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
