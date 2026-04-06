"use client";

import { useParams } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useBank } from "@/hooks/use-banks";
import { hasPermission } from "@/lib/permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BankForm } from "@/components/banks/form";

export function BankEditPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("banks");
  const bankQuery = useBank(params.id);

  if (!hasPermission(user, "administrator") || !permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `banks.update` para editar bancos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (bankQuery.isLoading) {
    return <Skeleton className="h-[360px] w-full" />;
  }

  if (bankQuery.isError || !bankQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar banco</CardTitle>
          <CardDescription>O banco nao pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <BankForm mode="edit" bank={bankQuery.data.data} />;
}
