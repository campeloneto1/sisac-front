"use client";

import Link from "next/link";
import { Crosshair, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useArmamentCalibers } from "@/hooks/use-armament-calibers";
import { useArmamentSizes } from "@/hooks/use-armament-sizes";
import { useArmamentTypes } from "@/hooks/use-armament-types";
import { useArmaments } from "@/hooks/use-armaments";
import { useGenders } from "@/hooks/use-genders";
import { usePermissions } from "@/hooks/use-permissions";
import { useSubunits } from "@/hooks/use-subunits";
import { useVariants } from "@/hooks/use-variants";
import type { ArmamentFilters } from "@/types/armament.type";
import { ArmamentsFilters } from "@/components/armaments/filters";
import { ArmamentsTable } from "@/components/armaments/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentsListPage() {
  const permissions = usePermissions("armaments");
  const [search, setSearch] = useState("");
  const [subunitId, setSubunitId] = useState("all");
  const [typeId, setTypeId] = useState("all");
  const [variantId, setVariantId] = useState("all");
  const [caliberId, setCaliberId] = useState("all");
  const [sizeId, setSizeId] = useState("all");
  const [genderId, setGenderId] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<ArmamentFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      subunit_id: subunitId !== "all" ? Number(subunitId) : null,
      armament_type_id: typeId !== "all" ? Number(typeId) : null,
      variant_id: variantId !== "all" ? Number(variantId) : null,
      armament_caliber_id: caliberId !== "all" ? Number(caliberId) : null,
      armament_size_id: sizeId !== "all" ? Number(sizeId) : null,
      gender_id: genderId !== "all" ? Number(genderId) : null,
      with_counts: true,
    }),
    [caliberId, genderId, page, search, sizeId, subunitId, typeId, variantId],
  );

  const armamentsQuery = useArmaments(filters);
  const subunitsQuery = useSubunits({ per_page: 100 });
  const typesQuery = useArmamentTypes({ per_page: 100 });
  const variantsQuery = useVariants({ per_page: 100 });
  const calibersQuery = useArmamentCalibers({ per_page: 100 });
  const sizesQuery = useArmamentSizes({ per_page: 100 });
  const gendersQuery = useGenders({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa da permissão `viewAny` para visualizar armamentos.
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
              Armamentos
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie o cadastro base de armamentos e suas classificações
              técnicas.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/armaments/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo armamento
            </Link>
          </Button>
        ) : null}
      </div>

      <ArmamentsFilters
        search={search}
        subunitId={subunitId}
        typeId={typeId}
        variantId={variantId}
        caliberId={caliberId}
        sizeId={sizeId}
        genderId={genderId}
        subunits={subunitsQuery.data?.data ?? []}
        types={typesQuery.data?.data ?? []}
        variants={variantsQuery.data?.data ?? []}
        calibers={calibersQuery.data?.data ?? []}
        sizes={sizesQuery.data?.data ?? []}
        genders={gendersQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onSubunitChange={(value) => {
          setSubunitId(value);
          setPage(1);
        }}
        onTypeChange={(value) => {
          setTypeId(value);
          setPage(1);
        }}
        onVariantChange={(value) => {
          setVariantId(value);
          setPage(1);
        }}
        onCaliberChange={(value) => {
          setCaliberId(value);
          setPage(1);
        }}
        onSizeChange={(value) => {
          setSizeId(value);
          setPage(1);
        }}
        onGenderChange={(value) => {
          setGenderId(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setSubunitId("all");
          setTypeId("all");
          setVariantId("all");
          setCaliberId("all");
          setSizeId("all");
          setGenderId("all");
          setPage(1);
        }}
      />

      {armamentsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : armamentsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar armamentos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissões do usuário
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !armamentsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum armamento encontrado</CardTitle>
            <CardDescription>
              Cadastre um novo armamento ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ArmamentsTable armaments={armamentsQuery.data.data} />
          <Pagination
            currentPage={armamentsQuery.data.meta.current_page}
            lastPage={armamentsQuery.data.meta.last_page}
            total={armamentsQuery.data.meta.total}
            from={armamentsQuery.data.meta.from}
            to={armamentsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={armamentsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
