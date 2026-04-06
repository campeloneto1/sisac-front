"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, MapPinned, Milestone, UserCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCityItem } from "@/hooks/use-cities";
import { hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CityShowPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("cities");
  const cityQuery = useCityItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `cities.view` para visualizar cidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (cityQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (cityQuery.isError || !cityQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar cidade</CardTitle>
          <CardDescription>Os dados da cidade nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const city = cityQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{city.name}</h1>
            <Badge variant="outline">{city.abbreviation || "Sem sigla"}</Badge>
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Cidade cadastrada no modulo administrativo para uso em enderecos, subunidades e demais entidades relacionadas.
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/cities/${city.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Visao geral</CardTitle>
            <CardDescription>Indicadores rapidos da cidade.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <MapPinned className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sigla</p>
                <p className="text-sm text-slate-700">{city.abbreviation || "Nao informada"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <Milestone className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Estado</p>
                <p className="text-sm text-slate-700">{city.state ? `${city.state.name} (${city.state.abbreviation})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                <p className="text-sm text-slate-700">{city.creator ? `${city.creator.name} (${city.creator.email})` : "Nao informado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <UserCircle2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                <p className="text-sm text-slate-700">{city.updater ? `${city.updater.name} (${city.updater.email})` : "Nao informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Contexto territorial</CardTitle>
            <CardDescription>Dados carregados pelo `CityResource` com o relacionamento de estado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {city.state ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                <p className="text-sm font-medium text-slate-900">{city.state.name}</p>
                <p className="mt-1 text-xs text-slate-500">Sigla oficial: {city.state.abbreviation}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Pais: {city.state.country ? `${city.state.country.name} (${city.state.country.abbreviation})` : "Nao informado"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Esta cidade ainda nao possui estado vinculado.</p>
            )}

            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <p className="text-sm text-slate-600">
                A cidade pode estar relacionada a empresas no backend. Se houver vinculos, a exclusao pode ser recusada pela API.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
