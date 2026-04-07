"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  FileText,
  Newspaper,
  UserCircle2,
} from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerPublication } from "@/hooks/use-police-officer-publications";
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

function getNatureVariant(isPositive?: boolean | null) {
  if (isPositive === true) return "success";
  if (isPositive === false) return "danger";
  return "secondary";
}

export function PoliceOfficerPublicationShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("police-officer-publications");
  const policeOfficerPublicationQuery = usePoliceOfficerPublication(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `view` para visualizar publicacoes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (policeOfficerPublicationQuery.isLoading) {
    return <Skeleton className="h-[560px] w-full" />;
  }

  if (
    policeOfficerPublicationQuery.isError ||
    !policeOfficerPublicationQuery.data
  ) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar publicacao</CardTitle>
          <CardDescription>
            Os dados da publicacao nao estao disponiveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const publication = policeOfficerPublicationQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {publication.bulletin}
            </h1>
            {publication.publication_type ? (
              <Badge
                variant={getNatureVariant(
                  publication.publication_type.is_positive,
                )}
              >
                {publication.publication_type.nature?.label ?? "Neutra"}
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {publication.police_officer?.war_name ??
              publication.police_officer?.user?.name ??
              `Policial #${publication.police_officer_id}`}{" "}
            • {publication.publication_date ?? "-"}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Registro completo da publicacao em boletim, incluindo tipo, conteudo
            e auditoria.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/police-officer-publications/${publication.id}/edit`}>
              Editar
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Dados da publicacao</CardTitle>
            <CardDescription>
              Informacoes principais do registro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Newspaper className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Boletim
                </p>
                <p className="text-sm text-slate-700">{publication.bulletin}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Data da publicacao
                </p>
                <p className="text-sm text-slate-700">
                  {publication.publication_date ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Tipo de publicacao
                </p>
                <p className="text-sm text-slate-700">
                  {publication.publication_type?.name ?? "Nao informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Conteudo
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {publication.content}
              </p>
            </div>

            {publication.external_link ? (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                <ExternalLink className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Link externo
                  </p>
                  <a
                    href={publication.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {publication.external_link}
                  </a>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto e auditoria</CardTitle>
            <CardDescription>
              Relacionamentos e responsaveis pela alteracao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Policial
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {publication.police_officer?.war_name ??
                  publication.police_officer?.user?.name ??
                  `Policial #${publication.police_officer_id}`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Matricula:{" "}
                {publication.police_officer?.registration_number ??
                  "Nao informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Tipo de publicacao
              </p>
              {publication.publication_type ? (
                <div className="mt-1">
                  <p className="text-sm text-slate-700">
                    {publication.publication_type.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Slug: {publication.publication_type.slug}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant={getNatureVariant(
                        publication.publication_type.is_positive,
                      )}
                    >
                      {publication.publication_type.nature?.label ?? "Neutra"}
                    </Badge>
                    {publication.publication_type.generates_points ? (
                      <Badge variant="info">Gera pontos</Badge>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-700">Nao informado</p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado por
                </p>
                <p className="text-sm text-slate-700">
                  {publication.creator
                    ? `${publication.creator.name} (${publication.creator.email})`
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
                  {publication.updater
                    ? `${publication.updater.name} (${publication.updater.email})`
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Timestamps
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Criado em: {publication.created_at ?? "-"}
              </p>
              <p className="text-sm text-slate-700">
                Atualizado em: {publication.updated_at ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
