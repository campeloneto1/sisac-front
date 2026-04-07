"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useColors } from "@/hooks/use-colors";
import { usePermissions } from "@/hooks/use-permissions";
import { useUsers } from "@/hooks/use-users";
import { useVariants } from "@/hooks/use-variants";
import { useVehicles } from "@/hooks/use-vehicles";
import { useVehicleTypes } from "@/hooks/use-vehicle-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { VehiclesFilters } from "@/components/vehicles/filters";
import { VehiclesTable } from "@/components/vehicles/table";

export function VehiclesListPage() {
  const permissions = usePermissions("vehicles");
  const [search, setSearch] = useState("");
  const [colorId, setColorId] = useState("all");
  const [vehicleTypeId, setVehicleTypeId] = useState("all");
  const [variantId, setVariantId] = useState("all");
  const [assignedToUserId, setAssignedToUserId] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [activity, setActivity] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      color_id: colorId !== "all" ? Number(colorId) : null,
      vehicle_type_id: vehicleTypeId !== "all" ? Number(vehicleTypeId) : null,
      variant_id: variantId !== "all" ? Number(variantId) : null,
      assigned_to_user_id:
        assignedToUserId !== "all" ? Number(assignedToUserId) : null,
      is_available:
        availability === "all" ? null : availability === "available",
      is_active: activity === "all" ? null : activity === "active",
    }),
    [
      activity,
      assignedToUserId,
      availability,
      colorId,
      page,
      search,
      variantId,
      vehicleTypeId,
    ],
  );

  const vehiclesQuery = useVehicles(filters);
  const colorsQuery = useColors({ per_page: 100 });
  const vehicleTypesQuery = useVehicleTypes({ per_page: 100 });
  const variantsQuery = useVariants({ per_page: 100 });
  const usersQuery = useUsers({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar veiculos.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Veiculos</h1>
          <p className="text-sm text-slate-500">
            Gestao operacional da frota com classificacao, disponibilidade e
            kilometragem.
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicles/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo veiculo
            </Link>
          </Button>
        ) : null}
      </div>

      <VehiclesFilters
        search={search}
        colorId={colorId}
        vehicleTypeId={vehicleTypeId}
        variantId={variantId}
        assignedToUserId={assignedToUserId}
        availability={availability}
        activity={activity}
        colors={colorsQuery.data?.data ?? []}
        vehicleTypes={vehicleTypesQuery.data?.data ?? []}
        variants={variantsQuery.data?.data ?? []}
        users={usersQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onColorChange={(value) => {
          setColorId(value);
          setPage(1);
        }}
        onVehicleTypeChange={(value) => {
          setVehicleTypeId(value);
          setPage(1);
        }}
        onVariantChange={(value) => {
          setVariantId(value);
          setPage(1);
        }}
        onAssignedToUserChange={(value) => {
          setAssignedToUserId(value);
          setPage(1);
        }}
        onAvailabilityChange={(value) => {
          setAvailability(value);
          setPage(1);
        }}
        onActivityChange={(value) => {
          setActivity(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setColorId("all");
          setVehicleTypeId("all");
          setVariantId("all");
          setAssignedToUserId("all");
          setAvailability("all");
          setActivity("all");
          setPage(1);
        }}
      />

      {vehiclesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : vehiclesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar veiculos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !vehiclesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum veiculo encontrado</CardTitle>
            <CardDescription>
              Cadastre um veiculo novo ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehiclesTable vehicles={vehiclesQuery.data.data} />
          <Pagination
            currentPage={vehiclesQuery.data.meta.current_page}
            lastPage={vehiclesQuery.data.meta.last_page}
            total={vehiclesQuery.data.meta.total}
            from={vehiclesQuery.data.meta.from}
            to={vehiclesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={vehiclesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
