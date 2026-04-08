"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useContractObjects } from "@/hooks/use-contract-objects";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractObjectsFilters } from "@/components/contract-objects/filters";
import { ContractObjectsTable } from "@/components/contract-objects/table";

export function ContractObjectsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("contract-objects");
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
  const contractObjectsQuery = useContractObjects(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `contract-objects.viewAny` para visualizar objetos de contrato.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Objetos de contrato</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro administrativo global dos objetos utilizados nos contratos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/contract-objects/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo objeto
            </Link>
          </Button>
        ) : null}
      </div>

      <ContractObjectsFilters
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

      {contractObjectsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contractObjectsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar objetos de contrato</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !contractObjectsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum objeto de contrato encontrado</CardTitle>
            <CardDescription>Crie um novo objeto ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ContractObjectsTable contractObjects={contractObjectsQuery.data.data} />
          <Pagination
            currentPage={contractObjectsQuery.data.meta.current_page}
            lastPage={contractObjectsQuery.data.meta.last_page}
            total={contractObjectsQuery.data.meta.total}
            from={contractObjectsQuery.data.meta.from}
            to={contractObjectsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={contractObjectsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
