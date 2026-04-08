"use client";

import Link from "next/link";
import { Boxes, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { useMaterialTypes } from "@/hooks/use-material-types";
import { useMaterials } from "@/hooks/use-materials";
import { usePermissions } from "@/hooks/use-permissions";
import { useVariants } from "@/hooks/use-variants";
import type { MaterialFilters } from "@/types/material.type";
import { MaterialsFilters } from "@/components/materials/filters";
import { MaterialsTable } from "@/components/materials/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialsListPage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("materials");
  const [search, setSearch] = useState("");
  const [materialTypeId, setMaterialTypeId] = useState("all");
  const [variantId, setVariantId] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<MaterialFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      material_type_id: materialTypeId !== "all" ? Number(materialTypeId) : null,
      variant_id: variantId !== "all" ? Number(variantId) : null,
    }),
    [materialTypeId, page, search, variantId],
  );

  const isEnabled = Boolean(activeSubunit) && permissions.canViewAny;
  const materialsQuery = useMaterials(filters, isEnabled);
  const materialTypesQuery = useMaterialTypes({ per_page: 100 });
  const variantsQuery = useVariants({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar materiais.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O módulo de materiais depende da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Materiais</h1>
            <p className="text-sm text-slate-500">
              Gerencie materiais da subunidade ativa, com controle de unidades individualizadas e lotes.
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              Contexto ativo: {activeSubunit.name}
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/materials/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo material
            </Link>
          </Button>
        ) : null}
      </div>

      <MaterialsFilters
        search={search}
        materialTypeId={materialTypeId}
        variantId={variantId}
        materialTypes={materialTypesQuery.data?.data ?? []}
        variants={variantsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onMaterialTypeChange={(value) => {
          setMaterialTypeId(value);
          setPage(1);
        }}
        onVariantChange={(value) => {
          setVariantId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setMaterialTypeId("all");
          setVariantId("all");
          setPage(1);
        }}
      />

      {materialsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : materialsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar materiais</CardTitle>
            <CardDescription>Verifique a API, a subunidade ativa e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !materialsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum material encontrado</CardTitle>
            <CardDescription>Cadastre um novo material ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <MaterialsTable materials={materialsQuery.data.data} />
          <Pagination
            currentPage={materialsQuery.data.meta.current_page}
            lastPage={materialsQuery.data.meta.last_page}
            total={materialsQuery.data.meta.total}
            from={materialsQuery.data.meta.from}
            to={materialsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={materialsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
