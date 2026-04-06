"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, Mail, MapPinned, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubunitItem } from "@/hooks/use-subunits";
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

function getAddressSummary(subunit: {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
}) {
  const parts = [subunit.street, subunit.number, subunit.neighborhood].filter(Boolean);
  const address = parts.join(", ");

  if (address && subunit.postal_code) {
    return `${address} • CEP ${subunit.postal_code}`;
  }

  return address || (subunit.postal_code ? `CEP ${subunit.postal_code}` : "Nao informado");
}

export function SubunitShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("subunits");
  const subunitQuery = useSubunitItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `subunits.view` para visualizar subunidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (subunitQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (subunitQuery.isError || !subunitQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar subunidade</CardTitle>
          <CardDescription>Os dados da subunidade nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const subunit = subunitQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{subunit.name}</h1>
            <Badge variant="outline">{subunit.abbreviation}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Subunidade administrativa estruturada para organizacao operacional, localizacao territorial e definicao de comando.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/subunits/${subunit.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Resumo rapido da subunidade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Telefone</p>
                <p className="text-sm text-slate-700">{subunit.phone || "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{subunit.email || "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPinned className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cidade</p>
                <p className="text-sm text-slate-700">{subunit.city ? `${subunit.city.name} (${subunit.city.abbreviation})` : "Nao informada"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{subunit.creator ? `${subunit.creator.name} (${subunit.creator.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{subunit.updater ? `${subunit.updater.name} (${subunit.updater.email})` : "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Estrutura e comando</CardTitle>
            <CardDescription>Dados retornados pelo `SubunitResource`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Unidade vinculada</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {subunit.unit ? `${subunit.unit.name} (${subunit.unit.abbreviation})` : "Nao informada"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Endereco consolidado</p>
              <p className="mt-1 text-sm text-slate-600">{getAddressSummary(subunit)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Cadeia de comando</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">Comandante: {getOfficerLabel(subunit.commander)}</p>
              <p className="mt-1 text-sm text-slate-600">Subcomandante: {getOfficerLabel(subunit.deputy_commander)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
