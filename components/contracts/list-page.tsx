"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BriefcaseBusiness, Plus } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import {
  useContractCompanies,
  useContracts,
  useContractTypesOptions,
} from "@/hooks/use-contracts";
import { usePermissions } from "@/hooks/use-permissions";
import type { ContractFilters, ContractStatus } from "@/types/contract.type";
import { ContractsFilters } from "@/components/contracts/filters";
import { ContractsTable } from "@/components/contracts/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractsListPage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("contracts");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [companyId, setCompanyId] = useState("all");
  const [contractTypeId, setContractTypeId] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<ContractFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      status: status !== "all" ? (status as ContractStatus) : undefined,
      company_id: companyId !== "all" ? Number(companyId) : undefined,
      contract_type_id: contractTypeId !== "all" ? Number(contractTypeId) : undefined,
      is_active: isActive === "all" ? undefined : isActive === "true",
    }),
    [companyId, contractTypeId, isActive, page, search, status],
  );

  const contractsQuery = useContracts(filters, Boolean(activeSubunit));
  const companiesQuery = useContractCompanies(Boolean(activeSubunit));
  const contractTypesQuery = useContractTypesOptions(Boolean(activeSubunit));

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar contratos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O módulo de contratos depende do contexto ativo para enviar `X-SUBUNIT-ACTIVE` em todas as requisicoes.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Contratos</h1>
            <p className="text-sm text-slate-500">Gerencie contratos da subunidade ativa com empresa, vigência, execução e responsáveis.</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Contexto ativo: {activeSubunit.name}</p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/contracts/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo contrato
            </Link>
          </Button>
        ) : null}
      </div>

      <ContractsFilters
        search={search}
        status={status}
        companyId={companyId}
        contractTypeId={contractTypeId}
        isActive={isActive}
        companies={companiesQuery.data?.data ?? []}
        contractTypes={contractTypesQuery.data?.data ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onCompanyChange={(value) => {
          setCompanyId(value);
          setPage(1);
        }}
        onContractTypeChange={(value) => {
          setContractTypeId(value);
          setPage(1);
        }}
        onIsActiveChange={(value) => {
          setIsActive(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setCompanyId("all");
          setContractTypeId("all");
          setIsActive("all");
          setPage(1);
        }}
      />

      {contractsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : contractsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar contratos</CardTitle>
            <CardDescription>Verifique a API, a subunidade ativa e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !contractsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum contrato encontrado</CardTitle>
            <CardDescription>Cadastre um contrato ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <ContractsTable contracts={contractsQuery.data.data} />
          <Pagination
            currentPage={contractsQuery.data.meta.current_page}
            lastPage={contractsQuery.data.meta.last_page}
            total={contractsQuery.data.meta.total}
            from={contractsQuery.data.meta.from}
            to={contractsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={contractsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
