"use client";

import Link from "next/link";
import { Crosshair, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useArmamentCalibers } from "@/hooks/use-armament-calibers";
import { usePermissions } from "@/hooks/use-permissions";
import { ArmamentCalibersFilters } from "@/components/armament-calibers/filters";
import { ArmamentCalibersTable } from "@/components/armament-calibers/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentCalibersListPage() {
  const permissions = usePermissions("armament-calibers");
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

  const armamentCalibersQuery = useArmamentCalibers(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar calibres de
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
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Calibres de armamento
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie os calibres usados para classificar armamentos.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/armament-calibers/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo calibre
            </Link>
          </Button>
        ) : null}
      </div>

      <ArmamentCalibersFilters
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

      {armamentCalibersQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : armamentCalibersQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar calibres de armamento</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !armamentCalibersQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum calibre encontrado</CardTitle>
            <CardDescription>
              Crie um novo calibre de armamento ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ArmamentCalibersTable
            armamentCalibers={armamentCalibersQuery.data.data}
          />
          <Pagination
            currentPage={armamentCalibersQuery.data.meta.current_page}
            lastPage={armamentCalibersQuery.data.meta.last_page}
            total={armamentCalibersQuery.data.meta.total}
            from={armamentCalibersQuery.data.meta.from}
            to={armamentCalibersQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={armamentCalibersQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
