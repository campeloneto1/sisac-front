"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficerPublications } from "@/hooks/use-police-officer-publications";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { usePublicationTypes } from "@/hooks/use-publication-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { PoliceOfficerPublicationsFilters } from "@/components/police-officer-publications/filters";
import { PoliceOfficerPublicationsTable } from "@/components/police-officer-publications/table";

export function PoliceOfficerPublicationsListPage() {
  const permissions = usePermissions("police-officer-publications");
  const [search, setSearch] = useState("");
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [publicationTypeId, setPublicationTypeId] = useState("all");
  const [publicationDateFrom, setPublicationDateFrom] = useState("");
  const [publicationDateTo, setPublicationDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      police_officer_id:
        policeOfficerId !== "all" ? Number(policeOfficerId) : undefined,
      publication_type_id:
        publicationTypeId !== "all" ? Number(publicationTypeId) : undefined,
      publication_date_from: publicationDateFrom || undefined,
      publication_date_to: publicationDateTo || undefined,
    }),
    [
      page,
      policeOfficerId,
      publicationDateFrom,
      publicationDateTo,
      publicationTypeId,
      search,
    ],
  );

  const policeOfficerPublicationsQuery = usePoliceOfficerPublications(filters);
  const policeOfficersQuery = usePoliceOfficers({ per_page: 100 });
  const publicationTypesQuery = usePublicationTypes({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar publicacoes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Publicacoes</h1>
          <p className="text-sm text-slate-500">
            Gerencie as publicacoes em boletim dos policiais.
          </p>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/police-officer-publications/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova publicacao
            </Link>
          </Button>
        ) : null}
      </div>

      <PoliceOfficerPublicationsFilters
        search={search}
        policeOfficerId={policeOfficerId}
        publicationTypeId={publicationTypeId}
        publicationDateFrom={publicationDateFrom}
        publicationDateTo={publicationDateTo}
        policeOfficers={policeOfficersQuery.data?.data ?? []}
        publicationTypes={publicationTypesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPoliceOfficerChange={(value) => {
          setPoliceOfficerId(value);
          setPage(1);
        }}
        onPublicationTypeChange={(value) => {
          setPublicationTypeId(value);
          setPage(1);
        }}
        onPublicationDateFromChange={(value) => {
          setPublicationDateFrom(value);
          setPage(1);
        }}
        onPublicationDateToChange={(value) => {
          setPublicationDateTo(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPoliceOfficerId("all");
          setPublicationTypeId("all");
          setPublicationDateFrom("");
          setPublicationDateTo("");
          setPage(1);
        }}
      />

      {policeOfficerPublicationsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : policeOfficerPublicationsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar publicacoes</CardTitle>
            <CardDescription>
              Verifique a API e as permissoes do usuario autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !policeOfficerPublicationsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma publicacao encontrada</CardTitle>
            <CardDescription>
              Crie uma nova publicacao ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <PoliceOfficerPublicationsTable
            policeOfficerPublications={policeOfficerPublicationsQuery.data.data}
          />
          <Pagination
            currentPage={policeOfficerPublicationsQuery.data.meta.current_page}
            lastPage={policeOfficerPublicationsQuery.data.meta.last_page}
            total={policeOfficerPublicationsQuery.data.meta.total}
            from={policeOfficerPublicationsQuery.data.meta.from}
            to={policeOfficerPublicationsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={policeOfficerPublicationsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
