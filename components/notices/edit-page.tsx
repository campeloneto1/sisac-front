"use client";

import { useParams } from "next/navigation";

import { useSubunit } from "@/contexts/subunit-context";
import { useNotice } from "@/hooks/use-notices";
import { usePermissions } from "@/hooks/use-permissions";
import { NoticeForm } from "@/components/notices/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NoticeEditPage() {
  const { activeSubunit } = useSubunit();
  const params = useParams<{ id: string }>();
  const permissions = usePermissions("notices");
  const noticeQuery = useNotice(params.id, Boolean(activeSubunit) && permissions.canUpdate);

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `update` para editar avisos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>Escolha uma subunidade ativa antes de editar avisos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (noticeQuery.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  if (noticeQuery.isError || !noticeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar aviso</CardTitle>
          <CardDescription>O aviso não pode ser editado agora.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <NoticeForm mode="edit" notice={noticeQuery.data.data} />;
}
