"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Palette, Tag, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useColor } from "@/hooks/use-colors";
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

function getColorPreviewStyle(hex?: string | null) {
  return {
    backgroundColor: hex && /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#e2e8f0",
  };
}

export function ColorShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("colors");
  const colorQuery = useColor(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `colors.view` para visualizar
            cores.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (colorQuery.isLoading) {
    return <Skeleton className="h-[460px] w-full" />;
  }

  if (colorQuery.isError || !colorQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar cor</CardTitle>
          <CardDescription>
            Os dados da cor nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const color = colorQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl border border-slate-200 shadow-sm"
              style={getColorPreviewStyle(color.hex)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl text-slate-900">
                {color.name}
              </h1>
              <Badge variant={color.is_active ? "success" : "danger"}>
                {color.is_active ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500">Slug: {color.slug}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Registro administrativo da cor com identificador tecnico, status e
            auditoria.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/colors/${color.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visual</CardTitle>
            <CardDescription>Preview rapido da cor cadastrada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="h-48 rounded-[24px] border border-slate-200 shadow-inner"
              style={getColorPreviewStyle(color.hex)}
            />
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                HEX
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {color.hex ?? "Nao informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>
              Identificacao tecnica e usuarios responsaveis pelo cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Slug
                </p>
                <p className="text-sm text-slate-700">{color.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Palette className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Status
                </p>
                <p className="text-sm text-slate-700">
                  {color.is_active ? "Cor ativa" : "Cor inativa"}
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
                  {color.creator
                    ? `${color.creator.name} (${color.creator.email})`
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
                  {color.updater
                    ? `${color.updater.name} (${color.updater.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {color.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {color.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
