"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Archive,
  ArrowRightLeft,
  Boxes,
  CalendarDays,
  Crosshair,
  FileText,
  Shapes,
  Tag,
} from "lucide-react";

import { useArmament } from "@/hooks/use-armaments";
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
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ArmamentShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armaments");
  const armamentQuery = useArmament(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar armamentos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (armamentQuery.isError || !armamentQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Não foi possível carregar o armamento</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se você possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const armament = armamentQuery.data.data;
  const specifications = Object.entries(armament.specifications ?? {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              {[armament.type?.name, armament.variant?.name]
                .filter(Boolean)
                .join(" ") || `Armamento #${armament.id}`}
            </h1>
            <p className="text-sm text-slate-500">
              Detalhes do cadastro base do armamento.
            </p>
          </div>
        </div>

        {permissions.canUpdate ? (
          <Button asChild>
            <Link href={`/armaments/${armament.id}/edit`}>Editar armamento</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
              <CardDescription>
                Dados principais do cadastro do armamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Crosshair className="h-4 w-4 text-primary" />
                  Tipo
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {armament.type?.name || "Não informado"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Shapes className="h-4 w-4 text-primary" />
                  Variante
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {armament.variant?.brand?.name
                    ? `${armament.variant.brand.name} - ${armament.variant.name}`
                    : armament.variant?.name || "Não informada"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Tag className="h-4 w-4 text-primary" />
                  Calibre
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {armament.caliber?.name || "Não informado"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Tag className="h-4 w-4 text-primary" />
                  Tamanho / Gênero
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {armament.size?.name || "Sem tamanho"} /{" "}
                  {armament.gender?.name || "Sem gênero"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 md:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Tag className="h-4 w-4 text-primary" />
                  Subunidade
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {armament.subunit?.abbreviation ||
                    armament.subunit?.name ||
                    "Não informada"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>Especificacoes</CardTitle>
              <CardDescription>
                Características técnicas adicionais do armamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specifications.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {specifications.map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                        <FileText className="h-4 w-4 text-primary" />
                        {key}
                      </div>
                      <p className="text-sm text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhuma especificação técnica informada.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Unidades</CardTitle>
                <CardDescription>
                  Acesse a area dedicada para gerenciar as unidades fisicas
                  deste armamento.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href={`/armaments/${armament.id}/units`}>
                  <Boxes className="mr-2 h-4 w-4" />
                  Gerenciar unidades
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Disponíveis
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Vencendo / vencidas
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Indisponiveis
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lotes</CardTitle>
                <CardDescription>
                  Acesse a area dedicada para gerenciar lotes e disponibilidade
                  deste armamento.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href={`/armaments/${armament.id}/batches`}>
                  <Archive className="mr-2 h-4 w-4" />
                  Gerenciar lotes
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Quantidade total
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Disponível
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Vencendo / vencidos
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Movimentacoes</CardTitle>
                <CardDescription>
                  Consulte o histórico operacional e os eventos de estoque deste
                  armamento.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href={`/armaments/${armament.id}/movements`}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Ver movimentacoes
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Entradas</p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Saidas</p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">
                  Ajustes / eventos
                </p>
                <p className="mt-2 text-3xl font-display text-slate-900">--</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Dados de criação e última atualização do cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-primary" />
                Criado em
              </div>
              <p className="text-sm text-slate-900">
                {formatDate(armament.created_at)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {armament.creator?.name || "Usuário não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-primary" />
                Atualizado em
              </div>
              <p className="text-sm text-slate-900">
                {formatDate(armament.updated_at)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {armament.updater?.name || "Usuário não informado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
