"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useWorkshops } from "@/hooks/use-workshops";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkshopsFilters } from "@/components/workshops/filters";
import { WorkshopsTable } from "@/components/workshops/table";

export function WorkshopsListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("workshops");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      status: status !== "all" ? status : null,
      city: city || undefined,
      state: state || undefined,
      specialty: specialty || undefined,
    }),
    [city, page, search, specialty, state, status],
  );

  const workshopsQuery = useWorkshops(filters);

  if (!hasPermission(user, "manager") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `manager` e `workshops.viewAny` para visualizar
            oficinas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-slate-900">Oficinas</h1>
              <p className="text-sm text-slate-500">
                Gerencie oficinas e parceiros de manutencao veicular.
              </p>
            </div>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/workshops/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova oficina
            </Link>
          </Button>
        ) : null}
      </div>

      <WorkshopsFilters
        search={search}
        status={status}
        city={city}
        state={state}
        specialty={specialty}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCityChange={(value) => {
          setCity(value);
          setPage(1);
        }}
        onStateChange={(value) => {
          setState(value);
          setPage(1);
        }}
        onSpecialtyChange={(value) => {
          setSpecialty(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setCity("");
          setState("");
          setSpecialty("");
          setPage(1);
        }}
      />

      {workshopsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : workshopsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar oficinas</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !workshopsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma oficina encontrada</CardTitle>
            <CardDescription>
              Cadastre uma nova oficina ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <WorkshopsTable workshops={workshopsQuery.data.data} />
          <Pagination
            currentPage={workshopsQuery.data.meta.current_page}
            lastPage={workshopsQuery.data.meta.last_page}
            total={workshopsQuery.data.meta.total}
            from={workshopsQuery.data.meta.from}
            to={workshopsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={workshopsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
