"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Wrench } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useServiceTypes } from "@/hooks/use-service-types";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceTypesFilters } from "@/components/service-types/filters";
import { ServiceTypesTable } from "@/components/service-types/table";
import type { ServiceTypeFilters } from "@/types/service-type.type";

export function ServiceTypesListPage() {
  const { user } = useAuth();
  const permissions = usePermissions("service-types");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("all");
  const [requiresApproval, setRequiresApproval] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<ServiceTypeFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      active: active === "all" ? null : active === "true",
      requires_approval:
        requiresApproval === "all" ? null : requiresApproval === "true",
    }),
    [active, page, requiresApproval, search],
  );

  const serviceTypesQuery = useServiceTypes(filters);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa de `administrator` e `service-types.viewAny` para
            visualizar tipos de servico.
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
              <h1 className="font-display text-3xl text-slate-900">
                Tipos de servico
              </h1>
              <p className="text-sm text-slate-500">
                Gerencie o catalogo administrativo global usado pelo modulo de servicos.
              </p>
            </div>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/service-types/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo tipo
            </Link>
          </Button>
        ) : null}
      </div>

      <ServiceTypesFilters
        search={search}
        active={active}
        requiresApproval={requiresApproval}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onActiveChange={(value) => {
          setActive(value);
          setPage(1);
        }}
        onRequiresApprovalChange={(value) => {
          setRequiresApproval(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setActive("all");
          setRequiresApproval("all");
          setPage(1);
        }}
      />

      {serviceTypesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : serviceTypesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar tipos de servico</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !serviceTypesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum tipo encontrado</CardTitle>
            <CardDescription>
              Crie um novo tipo ou refine a busca aplicada.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ServiceTypesTable serviceTypes={serviceTypesQuery.data.data} />
          <Pagination
            currentPage={serviceTypesQuery.data.meta.current_page}
            lastPage={serviceTypesQuery.data.meta.last_page}
            total={serviceTypesQuery.data.meta.total}
            from={serviceTypesQuery.data.meta.from}
            to={serviceTypesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={serviceTypesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
