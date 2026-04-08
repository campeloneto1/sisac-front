"use client";

import Link from "next/link";
import { ShieldPlus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useArmamentTypes } from "@/hooks/use-armament-types";
import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentTypesFilters } from "@/components/armament-types/filters";
import { ArmamentTypesTable } from "@/components/armament-types/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentTypesListPage() {
  const permissions = usePermissions("armament-types");
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

  const armamentTypesQuery = useArmamentTypes(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar tipos de
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
            <ShieldPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Tipos de armamento
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie as classificações usadas para organizar armamentos.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/armament-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <ArmamentTypesFilters
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

      {armamentTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : armamentTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de armamento</CardTitle>
            <CardDescription>
              Verifique a API e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !armamentTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo encontrado</CardTitle>
            <CardDescription>
              Crie um novo tipo de armamento ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ArmamentTypesTable armamentTypes={armamentTypesQuery.data.data} />
          <Pagination
            currentPage={armamentTypesQuery.data.meta.current_page}
            lastPage={armamentTypesQuery.data.meta.last_page}
            total={armamentTypesQuery.data.meta.total}
            from={armamentTypesQuery.data.meta.from}
            to={armamentTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={armamentTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
