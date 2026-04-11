"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, FileText, Layers, ShieldPlus, Tag } from "lucide-react";

import { useArmamentType } from "@/hooks/use-armament-types";
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

function formatDate(date?: string | null) {
  return date ? new Date(date).toLocaleDateString("pt-BR") : "Não informado";
}

export function ArmamentTypeShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("armament-types");
  const armamentTypeQuery = useArmamentType(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `view` para visualizar tipos de
            armamento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (armamentTypeQuery.isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  if (armamentTypeQuery.isError || !armamentTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de armamento</CardTitle>
          <CardDescription>
            Os dados do tipo não estão disponíveis no momento.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const armamentType = armamentTypeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            {armamentType.name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Slug: {armamentType.slug}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/armament-types/${armamentType.id}/edit`}>
              Editar
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
            <CardDescription>
              Dados principais do tipo de armamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <ShieldPlus className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Nome
                </p>
                <p className="text-sm text-slate-700">{armamentType.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Tag className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Slug
                </p>
                <p className="text-sm text-slate-700">{armamentType.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Layers className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Tipo de Controle
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      armamentType.control_type === "unit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {armamentType.control_type_label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {armamentType.control_type === "unit"
                      ? "(Controle individual por unidade)"
                      : "(Controle por lote/quantidade)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Descrição
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {armamentType.description ?? "Nenhuma descrição informada."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>
              Informações de criação e atualização do registro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Criado por
              </p>
              <p className="text-sm text-slate-700">
                {armamentType.creator?.name ?? "Não informado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Atualizado por
              </p>
              <p className="text-sm text-slate-700">
                {armamentType.updater?.name ?? "Não informado"}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Criado em
                </p>
                <p className="text-sm text-slate-700">
                  {formatDate(armamentType.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
