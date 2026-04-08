"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useColor } from "@/hooks/use-colors";
import { ColorForm } from "@/components/colors/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ColorEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("colors");
  const colorQuery = useColor(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `colors.update` para editar cores.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (colorQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (colorQuery.isError || !colorQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar cor</CardTitle>
          <CardDescription>A cor não pode ser editada agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ColorForm mode="edit" color={colorQuery.data.data} />;
}
