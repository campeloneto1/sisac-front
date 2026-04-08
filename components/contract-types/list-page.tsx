"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useContractTypes } from "@/hooks/use-contract-types";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractTypesFilters } from "@/components/contract-types/filters";
import { ContractTypesTable } from "@/components/contract-types/table";

export function ContractTypesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("contract-types");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
    }),
    [page, search],
  );
  const contractTypesQuery = useContractTypes(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `contract-types.viewAny` para visualizar tipos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Tipos de contrato</h1>
          <p className="text-sm text-slate-500">Gerencie a classificação administrativa e o modelo de faturamento padrao dos contratos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/contract-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <ContractTypesFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPage(1);
        }}
      />

      {contractTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contractTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de contrato</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !contractTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo de contrato encontrado</CardTitle>
            <CardDescription>Crie um novo tipo ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ContractTypesTable contractTypes={contractTypesQuery.data.data} />
          <Pagination
            currentPage={contractTypesQuery.data.meta.current_page}
            lastPage={contractTypesQuery.data.meta.last_page}
            total={contractTypesQuery.data.meta.total}
            from={contractTypesQuery.data.meta.from}
            to={contractTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={contractTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
