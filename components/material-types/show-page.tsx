"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Shapes, Tag, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useMaterialType } from "@/hooks/use-material-types";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialTypeShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("material-types");
  const materialTypeQuery = useMaterialType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `material-types.view` para
            visualizar tipos de material.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (materialTypeQuery.isLoading) {
    return <Skeleton className="h-[460px] w-full" />;
  }

  if (materialTypeQuery.isError || !materialTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de material</CardTitle>
          <CardDescription>
            Os dados do tipo de material não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const materialType = materialTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {materialType.name}
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Slug: {materialType.slug}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            {materialType.description?.trim() ||
              "Tipo administrativo global usado para classificar materiais em outros fluxos do sistema."}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/material-types/${materialType.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>
              Dados principais do tipo cadastrado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Shapes className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Nome
                </p>
                <p className="text-sm text-slate-700">{materialType.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Slug
                </p>
                <p className="text-sm text-slate-700">{materialType.slug}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Descrição
                </p>
                <p className="text-sm text-slate-700">
                  {materialType.description?.trim() || "Não informada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>
              Usuários responsáveis pelo cadastro e auditoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {materialType.creator
                    ? `${materialType.creator.name} (${materialType.creator.email})`
                    : "Não informado"}
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
                  {materialType.updater
                    ? `${materialType.updater.name} (${materialType.updater.email})`
                    : "Não informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {materialType.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {materialType.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
