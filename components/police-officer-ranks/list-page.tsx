"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerRanks } from "@/hooks/use-police-officer-ranks";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { BulkPromotionDialog } from "@/components/police-officer-ranks/bulk-promotion-dialog";
import { PoliceOfficerRanksFilters } from "@/components/police-officer-ranks/filters";
import { PoliceOfficerRanksTable } from "@/components/police-officer-ranks/table";

interface PoliceOfficerRanksListPageProps {
  policeOfficers?: Array<{ id: number; name?: string | null; registration_number?: string | null }>;
  ranks?: Array<{ id: number; name: string; abbreviation?: string | null }>;
}

export function PoliceOfficerRanksListPage({ policeOfficers = [], ranks = [] }: PoliceOfficerRanksListPageProps) {
  const permissions = usePermissions("police-officer-ranks");
  const [policeOfficerId, setPoliceOfficerId] = useState<number | undefined>();
  const [rankId, setRankId] = useState<number | undefined>();
  const [currentOnly, setCurrentOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isBulkPromotionOpen, setIsBulkPromotionOpen] = useState(false);
  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      police_officer_id: policeOfficerId,
      rank_id: rankId,
      current_only: currentOnly || undefined,
    }),
    [page, policeOfficerId, rankId, currentOnly],
  );
  const policeOfficerRanksQuery = usePoliceOfficerRanks(filters);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar promoções.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Promoções de Policiais</h1>
          <p className="text-sm text-slate-500">Gerencie o histórico de graduações e promoções dos policiais.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {permissions.canBulkPromote ? (
            <Button variant="outline" onClick={() => setIsBulkPromotionOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Promoção em massa
            </Button>
          ) : null}

          {permissions.canCreate ? (
            <Button asChild>
              <Link href="/police-officer-ranks/create">
                <Plus className="mr-2 h-4 w-4" />
                Nova promoção
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <PoliceOfficerRanksFilters
        policeOfficerId={policeOfficerId}
        rankId={rankId}
        currentOnly={currentOnly}
        onPoliceOfficerIdChange={(value) => {
          setPoliceOfficerId(value);
          setPage(1);
        }}
        onRankIdChange={(value) => {
          setRankId(value);
          setPage(1);
        }}
        onCurrentOnlyChange={(value) => {
          setCurrentOnly(value);
          setPage(1);
        }}
        onClear={() => {
          setPoliceOfficerId(undefined);
          setRankId(undefined);
          setCurrentOnly(false);
          setPage(1);
        }}
        policeOfficers={policeOfficers}
        ranks={ranks}
      />

      {policeOfficerRanksQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : policeOfficerRanksQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar promoções</CardTitle>
            <CardDescription>Verifique a API e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !policeOfficerRanksQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma promoção encontrada</CardTitle>
            <CardDescription>Crie uma nova promoção ou refine os filtros.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficerRanksTable policeOfficerRanks={policeOfficerRanksQuery.data.data} />
          <Pagination
            currentPage={policeOfficerRanksQuery.data.meta.current_page}
            lastPage={policeOfficerRanksQuery.data.meta.last_page}
            total={policeOfficerRanksQuery.data.meta.total}
            from={policeOfficerRanksQuery.data.meta.from}
            to={policeOfficerRanksQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={policeOfficerRanksQuery.isFetching}
          />
        </div>
      )}

      <BulkPromotionDialog
        open={isBulkPromotionOpen}
        onOpenChange={setIsBulkPromotionOpen}
        policeOfficers={policeOfficers}
        ranks={ranks}
      />
    </div>
  );
}
