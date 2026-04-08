"use client";

import Link from "next/link";
import { Boxes, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { useMaterialLoans } from "@/hooks/use-material-loans";
import { usePermissions } from "@/hooks/use-permissions";
import type {
  MaterialLoanFilters,
  MaterialLoanKind,
  MaterialLoanStatus,
} from "@/types/material-loan.type";
import { MaterialLoansFilters } from "@/components/material-loans/filters";
import { MaterialLoansTable } from "@/components/material-loans/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialLoansListPage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("material-loans");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<MaterialLoanFilters>(
    () => ({
      page,
      per_page: 15,
      kind: kind !== "all" ? (kind as MaterialLoanKind) : null,
      status: status !== "all" ? (status as MaterialLoanStatus) : null,
    }),
    [kind, page, status],
  );

  const isEnabled = Boolean(activeSubunit) && permissions.canViewAny;
  const loansQuery = useMaterialLoans(filters, isEnabled);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar emprestimos de
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
            O modulo de emprestimos de materiais depende da subunidade ativa
            para enviar `X-Active-Subunit`.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Emprestimos de materiais
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie cautelas e emprestimos temporarios vinculados aos
              materiais da subunidade ativa.
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Contexto ativo: {activeSubunit.name}
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/material-loans/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo emprestimo
            </Link>
          </Button>
        ) : null}
      </div>

      <MaterialLoansFilters
        kind={kind}
        status={status}
        onKindChange={(value) => {
          setKind(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onClear={() => {
          setKind("all");
          setStatus("all");
          setPage(1);
        }}
      />

      {loansQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : loansQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar emprestimos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !loansQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum emprestimo encontrado</CardTitle>
            <CardDescription>
              Crie um novo emprestimo ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <MaterialLoansTable loans={loansQuery.data.data} />
          <Pagination
            currentPage={loansQuery.data.meta.current_page}
            lastPage={loansQuery.data.meta.last_page}
            total={loansQuery.data.meta.total}
            from={loansQuery.data.meta.from}
            to={loansQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={loansQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
