"use client";

import { BellRing } from "lucide-react";
import { useMemo, useState } from "react";

import { useSubunit } from "@/contexts/subunit-context";
import { useAcknowledgeNoticeMutation, useMarkNoticeAsReadMutation } from "@/hooks/use-notice-mutations";
import { useMyNotices } from "@/hooks/use-notices";
import {
  getNoticePriorityBadgeVariant,
  getNoticePriorityLabel,
  getNoticeStatusBadgeVariant,
  getNoticeStatusLabel,
  getNoticeTypeBadgeVariant,
  getNoticeTypeLabel,
  type MyNoticeFilters,
} from "@/types/notice.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MyNoticesListPage() {
  const { activeSubunit } = useSubunit();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [ackFilter, setAckFilter] = useState("all");
  const [page, setPage] = useState(1);
  const filters = useMemo<MyNoticeFilters>(
    () => ({
      page,
      per_page: 15,
      search: search || undefined,
      type: type !== "all" ? (type as MyNoticeFilters["type"]) : undefined,
      read: readFilter === "all" ? null : readFilter === "read",
      acknowledged: ackFilter === "all" ? null : ackFilter === "acknowledged",
    }),
    [ackFilter, page, readFilter, search, type],
  );
  const myNoticesQuery = useMyNotices(filters, Boolean(activeSubunit));
  const markAsReadMutation = useMarkNoticeAsReadMutation();
  const acknowledgeMutation = useAcknowledgeNoticeMutation();

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>Seus avisos dependem da subunidade ativa para carregar o contexto correto.</CardDescription>
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
            <h1 className="font-display text-3xl text-slate-900">Meus avisos</h1>
            <p className="text-sm text-slate-500">Acompanhe os avisos visíveis para seu usuário no contexto da subunidade ativa.</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Contexto ativo: {activeSubunit.name}</p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Buscar por título ou conteúdo"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="info">Informativo</SelectItem>
              <SelectItem value="warning">Alerta</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={readFilter}
            onValueChange={(value) => {
              setReadFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Leitura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as leituras</SelectItem>
              <SelectItem value="unread">Não lidos</SelectItem>
              <SelectItem value="read">Lidos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={ackFilter}
            onValueChange={(value) => {
              setAckFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ciência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Sem ciência</SelectItem>
              <SelectItem value="acknowledged">Com ciência</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {myNoticesQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : myNoticesQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar avisos</CardTitle>
            <CardDescription>Os avisos visíveis para o seu usuário não estão disponíveis no momento.</CardDescription>
          </CardHeader>
        </Card>
      ) : !myNoticesQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhum aviso encontrado</CardTitle>
            <CardDescription>Ajuste os filtros ou aguarde novos avisos para a sua subunidade, perfil ou usuário.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {myNoticesQuery.data.data.map((notice) => (
              <Card key={notice.id} className={notice.has_read ? "border-slate-200/70 bg-white/80" : "border-sky-200 bg-sky-50/70"}>
                <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{notice.title}</h2>
                      <Badge variant={getNoticeTypeBadgeVariant(notice.type)}>{getNoticeTypeLabel(notice.type)}</Badge>
                      <Badge variant={getNoticePriorityBadgeVariant(notice.priority)}>{getNoticePriorityLabel(notice.priority)}</Badge>
                      <Badge variant={getNoticeStatusBadgeVariant(notice.status)}>{getNoticeStatusLabel(notice.status)}</Badge>
                      {!notice.has_read ? <Badge variant="info">Não lido</Badge> : null}
                      {notice.requires_acknowledgement && !notice.has_acknowledged ? <Badge variant="warning">Ciência pendente</Badge> : null}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-600">{notice.content}</p>
                    <p className="text-xs text-slate-500">
                      Publicado em {formatDateTime(notice.created_at)} • Início {formatDateTime(notice.starts_at)} • Fim {notice.ends_at ? formatDateTime(notice.ends_at) : "sem prazo"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Leitura: {notice.has_read ? formatDateTime(notice.read_at) : "não registrada"} • Ciência: {notice.has_acknowledged ? formatDateTime(notice.acknowledged_at) : "não registrada"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {!notice.has_read ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={markAsReadMutation.isPending}
                        onClick={() => void markAsReadMutation.mutateAsync(notice.id)}
                      >
                        Marcar como lido
                      </Button>
                    ) : null}
                    {notice.requires_acknowledgement && !notice.has_acknowledged ? (
                      <Button
                        type="button"
                        disabled={acknowledgeMutation.isPending}
                        onClick={() => void acknowledgeMutation.mutateAsync(notice.id)}
                      >
                        Confirmar ciência
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={myNoticesQuery.data.meta.current_page}
            lastPage={myNoticesQuery.data.meta.last_page}
            total={myNoticesQuery.data.meta.total}
            from={myNoticesQuery.data.meta.from}
            to={myNoticesQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={myNoticesQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
