"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useVariantBrands, useVariants } from "@/hooks/use-variants";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VariantsFilters } from "@/components/variants/filters";
import { VariantsTable } from "@/components/variants/table";

export function VariantsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("variants");
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      brand_id: brandId !== "all" ? Number(brandId) : null,
    }),
    [brandId, page, search],
  );
  const variantsQuery = useVariants(filters);
  const brandsQuery = useVariantBrands();

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa de `administrator` e `variants.viewAny` para visualizar variantes.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Variantes</h1>
          <p className="text-sm text-slate-500">Gerencie os modelos vinculados a marcas dentro do catalogo administrativo.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/variants/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova variante
            </Link>
          </Button>
        ) : null}
      </div>

      <VariantsFilters
        search={search}
        brandId={brandId}
        brands={brandsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onBrandChange={(value) => {
          setBrandId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setBrandId("all");
          setPage(1);
        }}
      />

      {variantsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : variantsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar variantes</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !variantsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma variante encontrada</CardTitle>
            <CardDescription>Crie uma nova variante ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VariantsTable variants={variantsQuery.data.data} />
          <Pagination
            currentPage={variantsQuery.data.meta.current_page}
            lastPage={variantsQuery.data.meta.last_page}
            total={variantsQuery.data.meta.total}
            from={variantsQuery.data.meta.from}
            to={variantsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={variantsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
