"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Crosshair, FileText, Tag } from "lucide-react";

import { useArmamentCaliber } from "@/hooks/use-armament-calibers";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value?: string | null) {
  if (!value) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ArmamentCaliberShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armament-calibers");
  const armamentCaliberQuery = useArmamentCaliber(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `view` para visualizar calibres de
            armamento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentCaliberQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (armamentCaliberQuery.isError || !armamentCaliberQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar o calibre</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se voce possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const armamentCaliber = armamentCaliberQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              {armamentCaliber.name}
            </h1>
            <p className="text-sm text-slate-500">
              Detalhes do calibre de armamento cadastrado.
            </p>
          </div>
        </div>

        {permissions.canUpdate ? (
          <Button asChild>
            <Link href={`/armament-calibers/${armamentCaliber.id}/edit`}>
              Editar calibre
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Identificacao</CardTitle>
            <CardDescription>
              Informacoes principais usadas no cadastro do calibre.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Crosshair className="h-4 w-4 text-primary" />
                  Nome
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {armamentCaliber.name}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Tag className="h-4 w-4 text-primary" />
                  Slug
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {armamentCaliber.slug}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <FileText className="h-4 w-4 text-primary" />
                Descricao
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {armamentCaliber.description || "Nenhuma descricao informada."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Dados de criacao e ultima atualizacao do cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-primary" />
                Criado em
              </div>
              <p className="text-sm text-slate-900">
                {formatDate(armamentCaliber.created_at)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {armamentCaliber.creator?.name || "Usuario nao informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-primary" />
                Atualizado em
              </div>
              <p className="text-sm text-slate-900">
                {formatDate(armamentCaliber.updated_at)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {armamentCaliber.updater?.name || "Usuario nao informado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
