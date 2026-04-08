"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { hasPermission } from "@/lib/permissions";
import { useBrands } from "@/hooks/use-brands";
import type { BrandType } from "@/types/brand.type";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandsFilters } from "@/components/brands/filters";
import { BrandsTable } from "@/components/brands/table";

export function BrandsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("brands");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<BrandType | "all">("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      type: type !== "all" ? type : null,
    }),
    [page, search, type],
  );
  const brandsQuery = useBrands(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `brands.viewAny` para visualizar
            marcas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Marcas</h1>
          <p className="text-sm text-slate-500">
            Cadastre e organize marcas usadas por modelos e catalogos mestres.
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/brands/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova marca
            </Link>
          </Button>
        ) : null}
      </div>

      <BrandsFilters
        search={search}
        type={type}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onTypeChange={(value) => {
          setType(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setType("all");
          setPage(1);
        }}
      />

      {brandsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : brandsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar marcas</CardTitle>
            <CardDescription>
              Verifique a API e as permissões do usuário autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !brandsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma marca encontrada</CardTitle>
            <CardDescription>
              Crie uma nova marca ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <BrandsTable brands={brandsQuery.data.data} />
          <Pagination
            currentPage={brandsQuery.data.meta.current_page}
            lastPage={brandsQuery.data.meta.last_page}
            total={brandsQuery.data.meta.total}
            from={brandsQuery.data.meta.from}
            to={brandsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={brandsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
