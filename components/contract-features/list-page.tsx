"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useContractFeatures } from "@/hooks/use-contract-features";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractFeaturesFilters } from "@/components/contract-features/filters";
import { ContractFeaturesTable } from "@/components/contract-features/table";

export function ContractFeaturesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("contract-features");
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
  const contractFeaturesQuery = useContractFeatures(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `contract-features.viewAny` para visualizar caracteristicas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Caracteristicas de contrato</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro administrativo global das caracteristicas vinculaveis aos tipos de contrato.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/contract-features/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova caracteristica
            </Link>
          </Button>
        ) : null}
      </div>

      <ContractFeaturesFilters
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

      {contractFeaturesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contractFeaturesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar caracteristicas</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !contractFeaturesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma caracteristica encontrada</CardTitle>
            <CardDescription>Crie uma nova caracteristica ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ContractFeaturesTable contractFeatures={contractFeaturesQuery.data.data} />
          <Pagination
            currentPage={contractFeaturesQuery.data.meta.current_page}
            lastPage={contractFeaturesQuery.data.meta.last_page}
            total={contractFeaturesQuery.data.meta.total}
            from={contractFeaturesQuery.data.meta.from}
            to={contractFeaturesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={contractFeaturesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
