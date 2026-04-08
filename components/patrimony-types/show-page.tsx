"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Landmark, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePatrimonyType } from "@/hooks/use-patrimony-types";
import { usePermissions } from "@/hooks/use-permissions";
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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PatrimonyTypeShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("patrimony-types");
  const patrimonyTypeQuery = usePatrimonyType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `patrimony-types.view` para
            visualizar tipos de patrimônio.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (patrimonyTypeQuery.isLoading) {
    return <Skeleton className="h-[440px] w-full" />;
  }

  if (patrimonyTypeQuery.isError || !patrimonyTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de patrimônio</CardTitle>
          <CardDescription>
            Os dados do tipo de patrimônio não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const patrimonyType = patrimonyTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            {patrimonyType.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            {patrimonyType.description?.trim() ||
              "Tipo administrativo global usado para classificar patrimônios em outros fluxos do sistema."}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/patrimony-types/${patrimonyType.id}/edit`}>Editar</Link>
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
              <Landmark className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Nome
                </p>
                <p className="text-sm text-slate-700">{patrimonyType.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Descrição
                </p>
                <p className="text-sm text-slate-700">
                  {patrimonyType.description?.trim() || "Não informada"}
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
                  {patrimonyType.creator
                    ? `${patrimonyType.creator.name} (${patrimonyType.creator.email})`
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
                  {patrimonyType.updater
                    ? `${patrimonyType.updater.name} (${patrimonyType.updater.email})`
                    : "Não informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {formatDateTime(patrimonyType.created_at)}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {formatDateTime(patrimonyType.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
