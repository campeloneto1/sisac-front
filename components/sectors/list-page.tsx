"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSectors } from "@/hooks/use-sectors";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { SectorsFilters } from "@/components/sectors/filters";
import { SectorsTable } from "@/components/sectors/table";

export function SectorsListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("sectors");
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
  const sectorsQuery = useSectors(filters, Boolean(activeSubunit));

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa de `administrator` e `sectors.viewAny` para visualizar setores.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Setores</h1>
          <p className="text-sm text-slate-500">
            Gerencie setores administrativos da subunidade ativa, com contato institucional e cadeia de comando local.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Contexto ativo: {activeSubunit?.name ?? "Nenhuma subunidade selecionada"}
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild disabled={!activeSubunit}>
            <Link href="/sectors/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo setor
            </Link>
          </Button>
        ) : null}
      </div>

      <SectorsFilters
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

      {!activeSubunit ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Selecione uma subunidade</CardTitle>
            <CardDescription>O recurso de setores depende do contexto ativo para enviar `X-SUBUNIT-ACTIVE` em todas as requisicoes.</CardDescription>
          </CardHeader>
        </Card>
      ) : sectorsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : sectorsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar setores</CardTitle>
            <CardDescription>Verifique a API, as permissões do usuário e o resource de `Sector`.</CardDescription>
          </CardHeader>
        </Card>
      ) : !sectorsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum setor encontrado</CardTitle>
            <CardDescription>Crie um novo setor para a subunidade ativa ou refine a busca.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <SectorsTable sectors={sectorsQuery.data.data} />
          <Pagination
            currentPage={sectorsQuery.data.meta.current_page}
            lastPage={sectorsQuery.data.meta.last_page}
            total={sectorsQuery.data.meta.total}
            from={sectorsQuery.data.meta.from}
            to={sectorsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={sectorsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
