"use client";

import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { useMemo, useState } from "react";

import { useArmamentSizes } from "@/hooks/use-armament-sizes";
import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentSizesFilters } from "@/components/armament-sizes/filters";
import { ArmamentSizesTable } from "@/components/armament-sizes/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentSizesListPage() {
  const permissions = usePermissions("armament-sizes");
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

  const armamentSizesQuery = useArmamentSizes(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar tamanhos de
            armamento.
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
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Tamanhos de armamento
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie os tamanhos usados para classificar armamentos.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/armament-sizes/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tamanho
            </Link>
          </Button>
        ) : null}
      </div>

      <ArmamentSizesFilters
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

      {armamentSizesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : armamentSizesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tamanhos de armamento</CardTitle>
            <CardDescription>
              Verifique a API e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !armamentSizesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tamanho encontrado</CardTitle>
            <CardDescription>
              Crie um novo tamanho de armamento ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ArmamentSizesTable armamentSizes={armamentSizesQuery.data.data} />
          <Pagination
            currentPage={armamentSizesQuery.data.meta.current_page}
            lastPage={armamentSizesQuery.data.meta.last_page}
            total={armamentSizesQuery.data.meta.total}
            from={armamentSizesQuery.data.meta.from}
            to={armamentSizesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={armamentSizesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
