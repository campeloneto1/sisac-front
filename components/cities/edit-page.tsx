"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCityItem } from "@/hooks/use-cities";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CityForm } from "@/components/cities/form";

export function CityEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("cities");
  const cityQuery = useCityItem(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `cities.update` para editar cidades.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (cityQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (cityQuery.isError || !cityQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar cidade</CardTitle>
          <CardDescription>A cidade não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CityForm mode="edit" city={cityQuery.data.data} />;
}
