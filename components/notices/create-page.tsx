"use client";

import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { NoticeForm } from "@/components/notices/form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NoticeCreatePage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("notices");

  if (!permissions.canCreate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `create` para cadastrar avisos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>Escolha uma subunidade ativa antes de cadastrar avisos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <NoticeForm mode="create" />;
}
