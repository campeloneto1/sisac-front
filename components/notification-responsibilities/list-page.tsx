"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { useNotificationDomains } from "@/hooks/use-notification-domains";
import { useNotificationResponsibilities } from "@/hooks/use-notification-responsibilities";
import { usePermissions } from "@/hooks/use-permissions";
import { useSectors } from "@/hooks/use-sectors";
import { useSubunits } from "@/hooks/use-subunits";
import { hasPermission } from "@/lib/permissions";
import { getDomainLabel } from "@/types/notification-responsibility.type";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationResponsibilitiesFilters } from "@/components/notification-responsibilities/filters";
import { NotificationResponsibilitiesTable } from "@/components/notification-responsibilities/table";

export function NotificationResponsibilitiesListPage() {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("notification-responsibilities");
  const [domain, setDomain] = useState("all");
  const [subunitId, setSubunitId] = useState(activeSubunit ? String(activeSubunit.id) : "all");
  const [sectorId, setSectorId] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      domain: domain === "all" ? undefined : domain,
      subunit_id: subunitId === "all" ? undefined : Number(subunitId),
      sector_id: sectorId === "all" ? undefined : Number(sectorId),
    }),
    [domain, page, sectorId, subunitId],
  );

  const itemsQuery = useNotificationResponsibilities(filters, Boolean(activeSubunit));
  const subunitsQuery = useSubunits({ per_page: 100 });
  const sectorsQuery = useSectors({ per_page: 100 }, Boolean(activeSubunit));
  const domainsQuery = useNotificationDomains();
  const activeSubunitId = activeSubunit ? String(activeSubunit.id) : null;
  const isDifferentSubunitSelected = Boolean(subunitId !== "all" && activeSubunitId && subunitId !== activeSubunitId);

  if (!hasPermission(user, "administrator") || !permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Você precisa de `administrator` e `notification-responsibilities.viewAny` para visualizar responsabilidades de notificação.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Responsabilidades de notificação</h1>
          <p className="text-sm text-slate-500">
            Configure qual setor recebe notificações automaticas por dominio em cada subunidade.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            Contexto ativo: {activeSubunit?.name ?? "Nenhuma subunidade selecionada"}
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild disabled={!activeSubunit}>
            <Link href="/notification-responsibilities/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova regra
            </Link>
          </Button>
        ) : null}
      </div>

      <NotificationResponsibilitiesFilters
        domain={domain}
        subunitId={subunitId}
        sectorId={sectorId}
        subunits={(subunitsQuery.data?.data ?? []).map((subunit) => ({
          id: subunit.id,
          name: subunit.name,
          abbreviation: subunit.abbreviation,
        }))}
        sectors={(sectorsQuery.data?.data ?? []).map((sector) => ({
          id: sector.id,
          name: sector.name,
          abbreviation: sector.abbreviation,
          subunit_id: sector.subunit_id,
        }))}
        domains={domainsQuery.data?.data ?? []}
        onDomainChange={(value) => {
          setDomain(value);
          setPage(1);
        }}
        onSubunitChange={(value) => {
          setSubunitId(value);
          setSectorId("all");
          setPage(1);
        }}
        onSectorChange={(value) => {
          setSectorId(value);
          setPage(1);
        }}
        onClear={() => {
          setDomain("all");
          setSubunitId(activeSubunit ? String(activeSubunit.id) : "all");
          setSectorId("all");
          setPage(1);
        }}
      />

      {!activeSubunit ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Selecione uma subunidade</CardTitle>
            <CardDescription>
              Este módulo exige `X-SUBUNIT-ACTIVE` em todas as requisicoes. Selecione uma subunidade no header para listar e editar as regras.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : isDifferentSubunitSelected ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardHeader>
            <CardTitle>Filtro de setor dependente do contexto</CardTitle>
            <CardDescription>
              Você esta filtrando a subunidade #{subunitId}, mas os setores carregados pertencem a subunidade ativa. Troque o contexto global para
              refinar por setor nessa subunidade.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {itemsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : itemsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar responsabilidades</CardTitle>
            <CardDescription>Verifique a API, as permissões do usuário e o contexto de subunidade ativo.</CardDescription>
          </CardHeader>
        </Card>
      ) : !itemsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma regra encontrada</CardTitle>
            <CardDescription>
              Não ha responsabilidade cadastrada para os filtros atuais{domain !== "all" ? ` no dominio ${domainsQuery.data?.data.find((d) => d.value === domain)?.label ?? domain}.` : "."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <NotificationResponsibilitiesTable items={itemsQuery.data.data} />
          <Pagination
            currentPage={itemsQuery.data.meta.current_page}
            lastPage={itemsQuery.data.meta.last_page}
            total={itemsQuery.data.meta.total}
            from={itemsQuery.data.meta.from}
            to={itemsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={itemsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
