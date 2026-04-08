"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Mail, MapPinned, Phone, ShieldCheck, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useUnitItem } from "@/hooks/use-units";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function getOfficerLabel(officer: { id: number; name?: string | null; registration_number?: string | null } | null | undefined) {
  if (!officer) {
    return "Não informado";
  }

  if (officer.name && officer.registration_number) {
    return `${officer.name} (${officer.registration_number})`;
  }

  return officer.name || officer.registration_number || `Policial #${officer.id}`;
}

function getAddressSummary(unit: {
  street?: string | null;
  number?: string | null;
  neighborhood?: string | null;
  postal_code?: string | null;
}) {
  const parts = [unit.street, unit.number, unit.neighborhood].filter(Boolean);
  const address = parts.join(", ");

  if (address && unit.postal_code) {
    return `${address} • CEP ${unit.postal_code}`;
  }

  return address || (unit.postal_code ? `CEP ${unit.postal_code}` : "Não informado");
}

export function UnitShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("units");
  const unitQuery = useUnitItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `units.view` para visualizar unidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (unitQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (unitQuery.isError || !unitQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar unidade</CardTitle>
          <CardDescription>Os dados da unidade não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unit = unitQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{unit.name}</h1>
            <Badge variant="outline">{unit.abbreviation}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Unidade administrativa estruturada para organizacao institucional, localização territorial e definicao de comando.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/units/${unit.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Resumo rápido da unidade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Telefone</p>
                <p className="text-sm text-slate-700">{unit.phone || "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{unit.email || "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPinned className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cidade</p>
                <p className="text-sm text-slate-700">{unit.city ? `${unit.city.name} (${unit.city.abbreviation})` : "Não informada"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{unit.creator ? `${unit.creator.name} (${unit.creator.email})` : "Não informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{unit.updater ? `${unit.updater.name} (${unit.updater.email})` : "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Endereco e comando</CardTitle>
            <CardDescription>Dados retornados pelo `UnitResource`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">Endereco consolidado</p>
              <p className="mt-1 text-sm text-slate-600">{getAddressSummary(unit)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-slate-900">Cadeia de comando</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">Comandante: {getOfficerLabel(unit.commander)}</p>
              <p className="mt-1 text-sm text-slate-600">Subcomandante: {getOfficerLabel(unit.deputy_commander)}</p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <p className="text-sm text-slate-600">
                A exclusão pode ser bloqueada pela policy do backend quando a unidade possui subunidades vinculadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
