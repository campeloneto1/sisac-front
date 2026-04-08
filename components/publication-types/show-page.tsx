"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, ShieldCheck, UserCircle2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePublicationType } from "@/hooks/use-publication-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicationTypeShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("publication-types");
  const publicationTypeQuery = usePublicationType(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar tipos de publicação.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (publicationTypeQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (publicationTypeQuery.isError || !publicationTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de publicação</CardTitle>
          <CardDescription>Os dados não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const publicationType = publicationTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{publicationType.name}</h1>
            <Badge
              variant={
                publicationType.nature?.value === "positive"
                  ? "success"
                  : publicationType.nature?.value === "negative"
                    ? "danger"
                    : "secondary"
              }
            >
              {publicationType.nature?.label ?? "Neutra"}
            </Badge>
            <Badge variant={publicationType.generates_points ? "info" : "secondary"}>
              {publicationType.generates_points ? "Gera pontos" : "Não gera pontos"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">Slug: {publicationType.slug}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Tipo administrativo utilizado para classificar publicações funcionais e orientar regras de pontos e natureza da publicação.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/publication-types/${publicationType.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Definicao</CardTitle>
            <CardDescription>Informações principais do tipo de publicação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Descrição</p>
              </div>
              <p className="mt-2 text-sm text-slate-700">{publicationType.description || "Sem descrição cadastrada."}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Regras</p>
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p>Natureza: {publicationType.nature?.label ?? "Neutra"}</p>
                <p>Pontuacao: {publicationType.generates_points ? "Gera pontos" : "Não gera pontos"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Usuários responsáveis pela criação e última atualização.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{publicationType.creator ? `${publicationType.creator.name} (${publicationType.creator.email})` : "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{publicationType.updater ? `${publicationType.updater.name} (${publicationType.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
