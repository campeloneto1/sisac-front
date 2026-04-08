"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useServiceType } from "@/hooks/use-service-types";
import { hasPermission } from "@/lib/permissions";
import { ServiceTypeForm } from "@/components/service-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceTypeEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("service-types");
  const serviceTypeQuery = useServiceType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `service-types.update` para
            editar tipos de serviço.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (serviceTypeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (serviceTypeQuery.isError || !serviceTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de serviço</CardTitle>
          <CardDescription>
            O tipo de serviço não pode ser editado agora.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ServiceTypeForm mode="edit" serviceType={serviceTypeQuery.data.data} />
  );
}
