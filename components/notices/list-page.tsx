"use client";

import Link from "next/link";
import { BellRing, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { useNotices } from "@/hooks/use-notices";
import { usePermissions } from "@/hooks/use-permissions";
import type { NoticeFilters } from "@/types/notice.type";
import { NoticesFilters } from "@/components/notices/filters";
import { NoticesTable } from "@/components/notices/table";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export function NoticesListPage() {
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("notices");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [isActive, setIsActive] = useState("all");
  const [isPinned, setIsPinned] = useState("all");
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState("all");
  const [page, setPage] = useState(1);

  const filters = useMemo<NoticeFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      type: type !== "all" ? (type as NoticeFilters["type"]) : undefined,
      visibility: visibility !== "all" ? (visibility as NoticeFilters["visibility"]) : undefined,
      priority: priority !== "all" ? Number(priority) as NoticeFilters["priority"] : undefined,
      status: status !== "all" ? (status as NoticeFilters["status"]) : undefined,
      is_active: isActive !== "all" ? isActive === "true" : undefined,
      is_pinned: isPinned !== "all" ? isPinned === "true" : undefined,
      requires_acknowledgement: requiresAcknowledgement !== "all" ? requiresAcknowledgement === "true" : undefined,
    }),
    [isActive, isPinned, page, priority, requiresAcknowledgement, search, status, type, visibility],
  );

  const noticesQuery = useNotices(filters, Boolean(activeSubunit) && permissions.canViewAny);

  if (!permissions.canViewAny) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `viewAny` para visualizar avisos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O módulo de avisos depende da subunidade ativa para enviar `X-SUBUNIT-ACTIVE`.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">Avisos</h1>
            <p className="text-sm text-slate-500">Gerencie avisos direcionados por subunidade, setor, perfil ou usuário.</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Contexto ativo: {activeSubunit.name}</p>
          </div>
        </div>

        {permissions.canCreate ? (
          <Button asChild>
            <Link href="/notices/create">
              <Plus className="mr-2 h-4 w-4" />
              Novo aviso
            </Link>
          </Button>
        ) : null}
      </div>

      <NoticesFilters
        search={search}
        type={type}
        visibility={visibility}
        priority={priority}
        status={status}
        isActive={isActive}
        isPinned={isPinned}
        requiresAcknowledgement={requiresAcknowledgement}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onTypeChange={(value) => {
          setType(value);
          setPage(1);
        }}
        onVisibilityChange={(value) => {
          setVisibility(value);
          setPage(1);
        }}
        onPriorityChange={(value) => {
          setPriority(value);
          setPage(1);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        onIsActiveChange={(value) => {
          setIsActive(value);
          setPage(1);
        }}
        onIsPinnedChange={(value) => {
          setIsPinned(value);
          setPage(1);
        }}
        onRequiresAcknowledgementChange={(value) => {
          setRequiresAcknowledgement(value);
          setPage(1);
        }}
        onClear={() => {
          setSearch("");
          setType("all");
          setVisibility("all");
          setPriority("all");
          setStatus("all");
          setIsActive("all");
          setIsPinned("all");
          setRequiresAcknowledgement("all");
          setPage(1);
        }}
      />

      {noticesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : noticesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar avisos</CardTitle>
            <CardDescription>Verifique a API, a subunidade ativa e as permissões do usuário autenticado.</CardDescription>
          </CardHeader>
        </Card>
      ) : !noticesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum aviso encontrado</CardTitle>
            <CardDescription>Cadastre um novo aviso ou refine os filtros aplicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <NoticesTable notices={noticesQuery.data.data} />
          <Pagination
            currentPage={noticesQuery.data.meta.current_page}
            lastPage={noticesQuery.data.meta.last_page}
            total={noticesQuery.data.meta.total}
            from={noticesQuery.data.meta.from}
            to={noticesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={noticesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
