"use client";

import Link from "next/link";
import { Crosshair, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useArmamentLoans } from "@/hooks/use-armament-loans";
import { useArmaments } from "@/hooks/use-armaments";
import { usePermissions } from "@/hooks/use-permissions";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import type {
  ArmamentLoanFilters,
  ArmamentLoanKind,
  ArmamentLoanStatus,
} from "@/types/armament-loan.type";
import { ArmamentLoansFilters } from "@/components/armament-loans/filters";
import { ArmamentLoansTable } from "@/components/armament-loans/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ArmamentLoansListPage() {
  const permissions = usePermissions("armament-loans");
  const [search, setSearch] = useState("");
  const [policeOfficerId, setPoliceOfficerId] = useState("all");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [armamentId, setArmamentId] = useState("all");
  const [loanedFrom, setLoanedFrom] = useState("");
  const [loanedTo, setLoanedTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<ArmamentLoanFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      police_officer_id:
        policeOfficerId !== "all" ? Number(policeOfficerId) : null,
      kind: kind !== "all" ? (kind as ArmamentLoanKind) : null,
      status: status !== "all" ? (status as ArmamentLoanStatus) : null,
      armament_id: armamentId !== "all" ? Number(armamentId) : null,
      loaned_from: loanedFrom || undefined,
      loaned_to: loanedTo || undefined,
    }),
    [armamentId, kind, loanedFrom, loanedTo, page, policeOfficerId, search, status],
  );

  const loansQuery = useArmamentLoans(filters);
  const officersQuery = usePoliceOfficers({ per_page: 100 });
  const armamentsQuery = useArmaments({ per_page: 100 });

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>
            Voce precisa da permissao `viewAny` para visualizar emprestimos de
            armamentos.
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
              Emprestimos de armamentos
            </h1>
            <p className="text-sm text-slate-500">
              Gerencie cautelas e emprestimos temporarios, incluindo devolucao
              parcial por item.
            </p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/armament-loans/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo emprestimo
            </Link>
          </Button>
        ) : null}
      </div>

      <ArmamentLoansFilters
        search={search}
        policeOfficerId={policeOfficerId}
        kind={kind}
        status={status}
        armamentId={armamentId}
        loanedFrom={loanedFrom}
        loanedTo={loanedTo}
        policeOfficers={officersQuery.data?.data ?? []}
        armaments={armamentsQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPoliceOfficerChange={(value) => {
          setPoliceOfficerId(value);
          setPage(1);
        }}
        onKindChange={(value) => {
          setKind(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onArmamentChange={(value) => {
          setArmamentId(value);
          setPage(1);
        }}
        onLoanedFromChange={(value) => {
          setLoanedFrom(value);
          setPage(1);
        }}
        onLoanedToChange={(value) => {
          setLoanedTo(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setPoliceOfficerId("all");
          setKind("all");
          setStatus("all");
          setArmamentId("all");
          setLoanedFrom("");
          setLoanedTo("");
          setPage(1);
        }}
      />

      {loansQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : loansQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar emprestimos</CardTitle>
            <CardDescription>
              Verifique a API, a subunidade ativa e as permissoes do usuario
              autenticado.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !loansQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum emprestimo encontrado</CardTitle>
            <CardDescription>
              Crie um novo emprestimo ou refine os filtros aplicados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ArmamentLoansTable loans={loansQuery.data.data} />
          <Pagination
            currentPage={loansQuery.data.meta.current_page}
            lastPage={loansQuery.data.meta.last_page}
            total={loansQuery.data.meta.total}
            from={loansQuery.data.meta.from}
            to={loansQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={loansQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
