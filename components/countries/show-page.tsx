"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Globe2, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCountry } from "@/hooks/use-countries";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CountryShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("countries");
  const countryQuery = useCountry(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `countries.view` para visualizar países.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (countryQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (countryQuery.isError || !countryQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar país</CardTitle>
          <CardDescription>Os dados do país não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const country = countryQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{country.name}</h1>
            <Badge variant="outline">{country.abbreviation}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            País cadastrado no módulo administrativo para uso em estruturas territoriais do sistema.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/countries/${country.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos do país.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Globe2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sigla</p>
                <p className="text-sm text-slate-700">{country.abbreviation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">
                  {country.creator ? `${country.creator.name} (${country.creator.email})` : "Não informado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">
                  {country.updater ? `${country.updater.name} (${country.updater.email})` : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Dados principais retornados pelo `CountryResource`.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">{country.name}</p>
              <p className="mt-1 text-xs text-slate-500">Sigla oficial: {country.abbreviation}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
