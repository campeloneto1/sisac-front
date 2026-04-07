"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useVehicleDamages } from "@/hooks/use-vehicle-damages";
import { useVehicles } from "@/hooks/use-vehicles";
import type {
  VehicleDamageDetectionMoment,
  VehicleDamageFilters,
  VehicleDamageSeverity,
  VehicleDamageStatus,
  VehicleDamageType,
} from "@/types/vehicle-damage.type";
import { VehicleDamagesFilters } from "@/components/vehicle-damages/filters";
import { VehicleDamagesTable } from "@/components/vehicle-damages/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function VehicleDamagesListPage() {
  const permissions = usePermissions("vehicle-damages");
  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState("all");
  const [damageType, setDamageType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [detectionMoment, setDetectionMoment] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<VehicleDamageFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      vehicle_id: vehicleId !== "all" ? Number(vehicleId) : null,
      damage_type:
        damageType !== "all" ? (damageType as VehicleDamageType) : undefined,
      severity:
        severity !== "all" ? (severity as VehicleDamageSeverity) : undefined,
      status: status !== "all" ? (status as VehicleDamageStatus) : undefined,
      detection_moment:
        detectionMoment !== "all"
          ? (detectionMoment as VehicleDamageDetectionMoment)
          : undefined,
    }),
    [damageType, detectionMoment, page, search, severity, status, vehicleId],
  );

  const damagesQuery = useVehicleDamages(filters);
  const vehiclesQuery = useVehicles({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar danos de
            veiculos.
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
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Danos de veiculos
            </h1>
            <p className="text-sm text-slate-500">
              Controle danos detectados na retirada, devolucao, manutencao ou
              inspecao.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/vehicle-damages/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo dano
            </Link>
          </Button>
        ) : null}
      </div>

      <VehicleDamagesFilters
        search={search}
        vehicleId={vehicleId}
        damageType={damageType}
        severity={severity}
        status={status}
        detectionMoment={detectionMoment}
        vehicles={vehiclesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onVehicleChange={(value) => {
          setVehicleId(value);
          setPage(1);
        }}
        onDamageTypeChange={(value) => {
          setDamageType(value);
          setPage(1);
        }}
        onSeverityChange={(value) => {
          setSeverity(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onDetectionMomentChange={(value) => {
          setDetectionMoment(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setVehicleId("all");
          setDamageType("all");
          setSeverity("all");
          setStatus("all");
          setDetectionMoment("all");
          setPage(1);
        }}
      />

      {damagesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : damagesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar danos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !damagesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum dano encontrado</CardTitle>
            <CardDescription>
              Registre um novo dano ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <VehicleDamagesTable damages={damagesQuery.data.data} />
          <Pagination
            currentPage={damagesQuery.data.meta.current_page}
            lastPage={damagesQuery.data.meta.last_page}
            total={damagesQuery.data.meta.total}
            from={damagesQuery.data.meta.from}
            to={damagesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={damagesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
