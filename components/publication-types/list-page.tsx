"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePublicationTypes } from "@/hooks/use-publication-types";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicationTypesFilters } from "@/components/publication-types/filters";
import { PublicationTypesTable } from "@/components/publication-types/table";

type BooleanFilterValue = "all" | "true" | "false";

function mapBooleanFilter(value: BooleanFilterValue) {
  if (value === "all") {
    return undefined;
  }

  return value === "true";
}

export function PublicationTypesListPage() {
  const permissions = usePermissions("publication-types");
  const [search, setSearch] = useState("");
  const [isPositive, setIsPositive] = useState<BooleanFilterValue>("all");
  const [generatesPoints, setGeneratesPoints] = useState<BooleanFilterValue>("all");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      is_positive: mapBooleanFilter(isPositive),
      generates_points: mapBooleanFilter(generatesPoints),
    }),
    [generatesPoints, isPositive, page, search],
  );
  const publicationTypesQuery = usePublicationTypes(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Voce precisa da permissao `viewAny` para visualizar tipos de publicacao.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Tipos de publicacao</h1>
          <p className="text-sm text-slate-500">Gerencie os tipos administrativos usados para classificar publicacoes dos policiais.</p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/publication-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <PublicationTypesFilters
        search={search}
        isPositive={isPositive}
        generatesPoints={generatesPoints}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onIsPositiveChange={(value) => {
          setIsPositive(value);
          setPage(1);
        }}
        onGeneratesPointsChange={(value) => {
          setGeneratesPoints(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setIsPositive("all");
          setGeneratesPoints("all");
          setPage(1);
        }}
      />

      {publicationTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : publicationTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de publicacao</CardTitle>
            <CardDescription>Verifique a API e as permissoes do usuario autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !publicationTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo encontrado</CardTitle>
            <CardDescription>Crie um novo tipo de publicacao ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PublicationTypesTable publicationTypes={publicationTypesQuery.data.data} />
          <Pagination
            currentPage={publicationTypesQuery.data.meta.current_page}
            lastPage={publicationTypesQuery.data.meta.last_page}
            total={publicationTypesQuery.data.meta.total}
            from={publicationTypesQuery.data.meta.from}
            to={publicationTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={publicationTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
