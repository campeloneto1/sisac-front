"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Mail, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSector } from "@/hooks/use-sectors";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getOfficerLabel(officer: { id: number; name?: string | null; registration_number?: string | null } | null | undefined) {
  if (!officer) {
    return "Nao informado";
  }

  if (officer.name && officer.registration_number) {
    return `${officer.name} (${officer.registration_number})`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

export function SectorShowPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("sectors");
  const sectorQuery = useSector(params.id, Boolean(activeSubunit));

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `sectors.view` para visualizar setores.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O detalhe do setor depende do contexto ativo da subunidade.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sectorQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (sectorQuery.isError || !sectorQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar setor</CardTitle>
          <CardDescription>Os dados do setor nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sector = sectorQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{sector.name}</h1>
            <Badge variant="outline">{sector.abbreviation ?? "Sem sigla"}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">Subunidade: {sector.subunit?.name ?? activeSubunit.name}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Setor administrativo contextual da subunidade ativa, usado para organizar contato institucional, cadeia de comando e fluxos locais.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/sectors/${sector.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Resumo rapido do setor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Telefone</p>
                <p className="text-sm text-slate-700">{sector.phone || "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{sector.email || "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{sector.creator ? `${sector.creator.name} (${sector.creator.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{sector.updater ? `${sector.updater.name} (${sector.updater.email})` : "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Estrutura e comando</CardTitle>
            <CardDescription>Dados retornados pelo `SectorResource` dentro do contexto ativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Subunidade vinculada</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {sector.subunit ? `${sector.subunit.name} (${sector.subunit.abbreviation ?? "Sem sigla"})` : activeSubunit.name}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Cadeia de comando</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">Comandante: {getOfficerLabel(sector.commander)}</p>
              <p className="mt-1 text-sm text-slate-600">Subcomandante: {getOfficerLabel(sector.deputy_commander)}</p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                Mudancas neste setor podem afetar alocacoes, responsabilidades de notificacao e outros fluxos internos da subunidade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
