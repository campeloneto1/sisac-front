"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePatrimonyType } from "@/hooks/use-patrimony-types";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { PatrimonyTypeForm } from "@/components/patrimony-types/form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PatrimonyTypeEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("patrimony-types");
  const patrimonyTypeQuery = usePatrimonyType(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `patrimony-types.update` para
            editar tipos de patrimônio.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (patrimonyTypeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (patrimonyTypeQuery.isError || !patrimonyTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de patrimônio</CardTitle>
          <CardDescription>
            O tipo de patrimônio não pode ser editado agora.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <PatrimonyTypeForm
      mode="edit"
      patrimonyType={patrimonyTypeQuery.data.data}
    />
  );
}
