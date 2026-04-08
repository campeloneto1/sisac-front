"use client";

import { useParams } from "next/navigation";
import { Boxes } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { MaterialLoanForm } from "@/components/material-loans/form";
import { useMaterialLoan } from "@/hooks/use-material-loans";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialLoanEditPage() {
  const params = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("material-loans");
  const loanQuery = useMaterialLoan(
    params.id,
    Boolean(activeSubunit) && permissions.canUpdate,
  );

  if (!permissions.canUpdate) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `update` para editar empréstimos de
            materiais.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>
            O módulo depende da subunidade ativa para carregar o empréstimo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loanQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-[34rem] w-full" />
      </div>
    );
  }

  if (loanQuery.isError || !loanQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Não foi possível carregar o empréstimo</CardTitle>
          <CardDescription>
            Verifique se o registro existe e se você possui acesso a ele.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const loan = loanQuery.data.data;

  if (loan.status === "returned") {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Empréstimo finalizado</CardTitle>
          <CardDescription>
            Empréstimos devolvidos não podem ser editados.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-slate-900">
            Editar empréstimo de material
          </h1>
          <p className="text-sm text-slate-500">
            Atualize cabecalho, aprovador e previsao sem alterar os itens já
            registrados.
          </p>
        </div>
      </div>

      <MaterialLoanForm mode="edit" loan={loan} />
    </div>
  );
}
