"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useBanks } from "@/hooks/use-banks";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { BanksFilters } from "@/components/banks/filters";
import { BanksTable } from "@/components/banks/table";

export function BanksListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("banks");
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
  const banksQuery = useBanks(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `banks.viewAny` para visualizar bancos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Bancos</h1>
          <p className="text-sm text-slate-500">Gerencie o cadastro administrativo de bancos utilizado por outros modulos.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/banks/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo banco
            </Link>
          </Button>
        ) : null}
      </div>

      <BanksFilters
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

      {banksQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : banksQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar bancos</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !banksQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum banco encontrado</CardTitle>
            <CardDescription>Crie um novo banco ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <BanksTable banks={banksQuery.data.data} />
          <Pagination
            currentPage={banksQuery.data.meta.current_page}
            lastPage={banksQuery.data.meta.last_page}
            total={banksQuery.data.meta.total}
            from={banksQuery.data.meta.from}
            to={banksQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={banksQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
