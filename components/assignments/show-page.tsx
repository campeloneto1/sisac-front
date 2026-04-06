"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BriefcaseBusiness, FolderKanban, UserCircle2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useAssignment } from "@/hooks/use-assignments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentShowPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("assignments");
  const assignmentQuery = useAssignment(params.id);

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar funções e atribuições.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (assignmentQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (assignmentQuery.isError || !assignmentQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar função</CardTitle>
          <CardDescription>Os dados da função não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const assignment = assignmentQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{assignment.name}</h1>
            {assignment.category ? (
              <Badge variant="secondary" className="capitalize">
                {assignment.category}
              </Badge>
            ) : null}
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Função institucional cadastrada no submenu Gestor para uso em alocações e históricos funcionais.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/assignments/${assignment.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Informações gerais</CardTitle>
            <CardDescription>Dados básicos da função/atribuição.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nome</p>
                <p className="text-sm text-slate-700">{assignment.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <FolderKanban className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Categoria</p>
                <p className="text-sm text-slate-700 capitalize">{assignment.category ?? "Não informada"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Informações de criação e atualização do registro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {assignment.creator ? `${assignment.creator.name} (${assignment.creator.email})` : "Não informado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {assignment.updater ? `${assignment.updater.name} (${assignment.updater.email})` : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
