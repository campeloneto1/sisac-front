"use client";

import Link from "next/link";
import { Landmark, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { usePatrimonies } from "@/hooks/use-patrimonies";
import { usePatrimonyTypes } from "@/hooks/use-patrimony-types";
import { usePermissions } from "@/hooks/use-permissions";
import { useSectors } from "@/hooks/use-sectors";
import type { PatrimonyFilters, PatrimonyStatusValue } from "@/types/patrimony.type";
import { PatrimoniesFilters } from "@/components/patrimonies/filters";
import { PatrimoniesTable } from "@/components/patrimonies/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function PatrimoniesListPage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("patrimonies");
  const [search, setSearch] = useState("");
  const [patrimonyTypeId, setPatrimonyTypeId] = useState("all");
  const [sectorId, setSectorId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<PatrimonyFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      patrimony_type_id:
        patrimonyTypeId !== "all" ? Number(patrimonyTypeId) : null,
      current_sector_id: sectorId !== "all" ? Number(sectorId) : null,
      status: status !== "all" ? (status as PatrimonyStatusValue) : null,
    }),
    [page, search, patrimonyTypeId, sectorId, status],
  );

  const isEnabled = Boolean(activeSubunit) && permissions.canViewAny;
  const patrimoniesQuery = usePatrimonies(filters, isEnabled);
  const patrimonyTypesQuery = usePatrimonyTypes({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 }, isEnabled);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar patrimônios.
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
            O módulo de patrimônios depende da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.
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
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Patrimônios</h1>
            <p className="text-sm text-slate-500">
              Gerencie os bens patrimoniais da subunidade ativa, com histórico setorial e baixa controlada.
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Contexto ativo: {activeSubunit.name}
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/patrimonies/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo patrimônio
            </Link>
          </Button>
        ) : null}
      </div>

      <PatrimoniesFilters
        search={search}
        patrimonyTypeId={patrimonyTypeId}
        sectorId={sectorId}
        status={status}
        patrimonyTypes={patrimonyTypesQuery.data?.data ?? []}
        sectors={sectorsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPatrimonyTypeChange={(value) => {
          setPatrimonyTypeId(value);
          setPage(1);
        }}
        onSectorChange={(value) => {
          setSectorId(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPatrimonyTypeId("all");
          setSectorId("all");
          setStatus("all");
          setPage(1);
        }}
      />

      {patrimoniesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : patrimoniesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar patrimônios</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !patrimoniesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum patrimônio encontrado</CardTitle>
            <CardDescription>
              Cadastre um novo patrimônio ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PatrimoniesTable patrimonies={patrimoniesQuery.data.data} />
          <Pagination
            currentPage={patrimoniesQuery.data.meta.current_page}
            lastPage={patrimoniesQuery.data.meta.last_page}
            total={patrimoniesQuery.data.meta.total}
            from={patrimoniesQuery.data.meta.from}
            to={patrimoniesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={patrimoniesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
