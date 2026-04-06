"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCountry } from "@/hooks/use-countries";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryForm } from "@/components/countries/form";

export function CountryEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("countries");
  const countryQuery = useCountry(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `countries.update` para editar paises.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (countryQuery.isLoading) {
    return <Skeleton className="h-[320px] w-full" />;
  }

  if (countryQuery.isError || !countryQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar pais</CardTitle>
          <CardDescription>O pais nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CountryForm mode="edit" country={countryQuery.data.data} />;
}
