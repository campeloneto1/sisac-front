"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GraduationCap, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useEducationLevel } from "@/hooks/use-education-levels";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EducationLevelShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("education-levels");
  const educationLevelQuery = useEducationLevel(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `education-levels.view` para visualizar niveis de escolaridade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (educationLevelQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (educationLevelQuery.isError || !educationLevelQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar nivel de escolaridade</CardTitle>
          <CardDescription>Os dados do nivel de escolaridade não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const educationLevel = educationLevelQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">{educationLevel.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Nivel de escolaridade cadastrado no módulo administrativo para uso em policiais e outras classificações dependentes.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/education-levels/${educationLevel.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do nivel de escolaridade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Nome</p>
                <p className="text-sm text-slate-700">{educationLevel.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {educationLevel.creator ? `${educationLevel.creator.name} (${educationLevel.creator.email})` : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {educationLevel.updater ? `${educationLevel.updater.name} (${educationLevel.updater.email})` : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Uso administrativo</CardTitle>
            <CardDescription>Contexto funcional do cadastro de escolaridade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Cadastro global</p>
              <p className="mt-2 text-sm text-slate-600">
                Este nivel pode ser referenciado por policiais e outros módulos que dependam da classificação educacional.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                Se existirem registros vinculados a este nivel, a exclusão pode ser recusada pela API ou pelo banco de dados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
