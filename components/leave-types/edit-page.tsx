"use client";

import { useParams } from "next/navigation";

import { usePermissions } from "@/hooks/use-permissions";
import { useLeaveType } from "@/hooks/use-leave-types";
import { LeaveTypeForm } from "@/components/leave-types/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaveTypeEditPage() {
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("leave-types");
  const leaveTypeQuery = useLeaveType(params.id);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `update` para editar tipos de afastamento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (leaveTypeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (leaveTypeQuery.isError || !leaveTypeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar tipo de afastamento</CardTitle>
          <CardDescription>Os dados do tipo de afastamento nao estao disponiveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <LeaveTypeForm mode="edit" leaveType={leaveTypeQuery.data.data} />;
}
