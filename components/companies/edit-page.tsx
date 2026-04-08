"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useCompany } from "@/hooks/use-companies";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/companies/form";

export function CompanyEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("companies");
  const companyQuery = useCompany(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `companies.update` para editar empresas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (companyQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (companyQuery.isError || !companyQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar empresa</CardTitle>
          <CardDescription>A empresa não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <CompanyForm mode="edit" company={companyQuery.data.data} />;
}
