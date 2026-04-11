"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BellRing, CalendarClock, Pin, ShieldCheck, UserCircle2, Users } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useNotice, useNoticeReads, useNoticeTargets } from "@/hooks/use-notices";
import { usePermissions } from "@/hooks/use-permissions";
import { useRoles } from "@/hooks/use-roles";
import { useSectors } from "@/hooks/use-sectors";
import { useUsers } from "@/hooks/use-users";
import { NoticeReadTable } from "@/components/notices/notice-read-table";
import { NoticeTargetTable } from "@/components/notices/notice-target-table";
import {
  getNoticePriorityBadgeVariant,
  getNoticePriorityLabel,
  getNoticeStatusBadgeVariant,
  getNoticeStatusLabel,
  getNoticeTypeBadgeVariant,
  getNoticeTypeLabel,
  getNoticeVisibilityLabel,
} from "@/types/notice.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não definido";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NoticeShowPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("notices");
  const [activeTab, setActiveTab] = useState("summary");
  const [readsPage, setReadsPage] = useState(1);
  const [readsSearch, setReadsSearch] = useState("");
  const [readsAckFilter, setReadsAckFilter] = useState("all");
  const [targetsPage, setTargetsPage] = useState(1);
  const [targetsSearch, setTargetsSearch] = useState("");
  const [targetsTypeFilter, setTargetsTypeFilter] = useState("all");

  const readsFilters = useMemo(
    () => ({
      page: readsPage,
      per_page: 20,
      search: readsSearch || undefined,
      acknowledged: readsAckFilter === "all" ? undefined : readsAckFilter === "acknowledged",
    }),
    [readsPage, readsSearch, readsAckFilter],
  );

  const targetsFilters = useMemo(
    () => ({
      page: targetsPage,
      per_page: 20,
      search: targetsSearch || undefined,
      target_type: targetsTypeFilter === "all" ? undefined : (targetsTypeFilter as "user" | "sector" | "role"),
    }),
    [targetsPage, targetsSearch, targetsTypeFilter],
  );

  const noticeQuery = useNotice(id, Boolean(activeSubunit) && permissions.canView);
  const noticeReadsQuery = useNoticeReads(id, readsFilters, Boolean(activeSubunit) && permissions.canView && activeTab === "reads");
  const noticeTargetsQuery = useNoticeTargets(id, targetsFilters, Boolean(activeSubunit) && permissions.canView && activeTab === "targets");

  if (!permissions.canView) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Acesso negado</CardTitle>
          <CardDescription>Você precisa da permissão `view` para visualizar avisos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeSubunit) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Selecione uma subunidade</CardTitle>
          <CardDescription>O módulo de avisos depende da subunidade ativa para carregar os dados do registro.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (noticeQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (noticeQuery.isError || !noticeQuery.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar aviso</CardTitle>
          <CardDescription>Os dados do aviso não estão disponíveis no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const notice = noticeQuery.data.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">{notice.title}</h1>
            <Badge variant={getNoticeTypeBadgeVariant(notice.type)}>{getNoticeTypeLabel(notice.type)}</Badge>
            <Badge variant={getNoticePriorityBadgeVariant(notice.priority)}>{getNoticePriorityLabel(notice.priority)}</Badge>
            <Badge variant={getNoticeStatusBadgeVariant(notice.status)}>{getNoticeStatusLabel(notice.status)}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Subunidade: {notice.subunit?.abbreviation ?? notice.subunit?.name ?? activeSubunit.name} • Visibilidade: {getNoticeVisibilityLabel(notice.visibility)}
          </p>
        </div>

        {permissions.canUpdate ? (
          <Button asChild variant="outline">
            <Link href={`/notices/${notice.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="targets">Destinatários</TabsTrigger>
          <TabsTrigger value="reads">Leituras e ciência</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Conteúdo</CardTitle>
                <CardDescription>Mensagem principal do aviso publicada para os destinatários.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{notice.content}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Resumo operacional</CardTitle>
                <CardDescription>Indicadores principais do aviso no contexto da subunidade ativa.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <BellRing className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tipo e prioridade</p>
                    <p className="text-sm text-slate-700">
                      {getNoticeTypeLabel(notice.type)} • {getNoticePriorityLabel(notice.priority)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Pin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Fixação e ciência</p>
                    <p className="text-sm text-slate-700">
                      {notice.is_pinned ? "Fixado" : "Não fixado"} • {notice.requires_acknowledgement ? "Exige ciência" : "Sem exigência de ciência"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Alcance e leitura</p>
                    <p className="text-sm text-slate-700">
                      {notice.targets_count ?? 0} alvo(s) • {notice.reads_count ?? 0} leitura(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status do usuário atual</p>
                    <p className="text-sm text-slate-700">
                      {notice.has_read ? "Lido" : "Ainda não lido"} • {notice.has_acknowledged ? "Ciente" : "Sem confirmação"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Janela de exibição</CardTitle>
                <CardDescription>Datas consideradas pela API para ativação e expiração do aviso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Início</p>
                    <p className="text-sm text-slate-700">{formatDateTime(notice.starts_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Fim</p>
                    <p className="text-sm text-slate-700">{formatDateTime(notice.ends_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Auditoria</CardTitle>
                <CardDescription>Informações de criação, atualização e contexto do aviso.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Criado por</p>
                    <p className="text-sm text-slate-700">{notice.creator ? `${notice.creator.name} (${notice.creator.email})` : "Não informado"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atualizado por</p>
                    <p className="text-sm text-slate-700">{notice.updater ? `${notice.updater.name} (${notice.updater.email})` : "Não informado"}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Timestamps</p>
                  <p className="mt-1 text-sm text-slate-700">Criado em: {formatDateTime(notice.created_at)}</p>
                  <p className="text-sm text-slate-700">Atualizado em: {formatDateTime(notice.updated_at)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Resumo de destinatários</CardTitle>
                <CardDescription>
                  Estatísticas gerais sobre os destinatários deste aviso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total de destinatários</p>
                    <p className="text-sm text-slate-700">{notice.targets_count ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>NoticeTarget</CardTitle>
                <CardDescription>
                  Os destinatários são geridos como sub-recurso do aviso, respeitando a subunidade ativa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>
                  Este endpoint lista todos os destinatários configurados para o aviso, incluindo usuários individuais, setores, perfis ou configuração geral.
                </p>
                <p>
                  Para editar os destinatários, use o formulário de edição do aviso.
                </p>
              </CardContent>
            </Card>
          </div>

          {!noticeTargetsQuery.isError && (
            <Card className="border-slate-200/70 bg-white/80">
              <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
                <Input
                  placeholder="Buscar por nome"
                  value={targetsSearch}
                  onChange={(event) => {
                    setTargetsSearch(event.target.value);
                    setTargetsPage(1);
                  }}
                />

                <Select
                  value={targetsTypeFilter}
                  onValueChange={(value) => {
                    setTargetsTypeFilter(value);
                    setTargetsPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="sector">Setor</SelectItem>
                    <SelectItem value="role">Perfil</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <div>
            {noticeTargetsQuery.isLoading ? (
              <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-8 text-center">
                <p className="text-sm text-slate-500">Carregando destinatários...</p>
              </div>
            ) : noticeTargetsQuery.isError ? (
              <Card className="border-slate-200/70 bg-white/80">
                <CardHeader>
                  <CardTitle>Erro ao carregar destinatários</CardTitle>
                  <CardDescription>
                    Não foi possível carregar os destinatários deste aviso.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
                <NoticeTargetTable targets={noticeTargetsQuery.data?.data ?? []} />
                {noticeTargetsQuery.data?.meta && noticeTargetsQuery.data.meta.last_page > 1 ? (
                  <Pagination
                    currentPage={noticeTargetsQuery.data.meta.current_page}
                    lastPage={noticeTargetsQuery.data.meta.last_page}
                    total={noticeTargetsQuery.data.meta.total}
                    from={noticeTargetsQuery.data.meta.from}
                    to={noticeTargetsQuery.data.meta.to}
                    onPageChange={setTargetsPage}
                    isDisabled={noticeTargetsQuery.isLoading}
                  />
                ) : null}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reads" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>Resumo de leituras</CardTitle>
                <CardDescription>
                  Estatísticas gerais sobre as leituras e ciências deste aviso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Leituras registradas</p>
                    <p className="text-sm text-slate-700">{notice.reads_count ?? 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Leitura do usuário atual</p>
                    <p className="text-sm text-slate-700">{notice.has_read ? `Lido em ${formatDateTime(notice.read_at)}` : "Ainda não lido"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Ciência do usuário atual</p>
                    <p className="text-sm text-slate-700">
                      {notice.has_acknowledged ? `Confirmada em ${formatDateTime(notice.acknowledged_at)}` : "Sem confirmação registrada"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>NoticeRead</CardTitle>
                <CardDescription>
                  O histórico de leitura e ciência é mantido como sub-recurso interno do aviso e atualizado pelas ações da API.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>
                  O fluxo operacional já existe por meio das ações `markAsRead` e `acknowledge`, então o sub-recurso faz parte do módulo `Notice`.
                </p>
                <p>
                  A tabela abaixo exibe a lista completa de usuários que leram este aviso, incluindo os timestamps de leitura e confirmação de ciência.
                </p>
              </CardContent>
            </Card>
          </div>

          {!noticeReadsQuery.isError && (
            <Card className="border-slate-200/70 bg-white/80">
              <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
                <Input
                  placeholder="Buscar por nome ou email do usuário"
                  value={readsSearch}
                  onChange={(event) => {
                    setReadsSearch(event.target.value);
                    setReadsPage(1);
                  }}
                />

                <Select
                  value={readsAckFilter}
                  onValueChange={(value) => {
                    setReadsAckFilter(value);
                    setReadsPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por ciência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="acknowledged">Ciente</SelectItem>
                    <SelectItem value="not_acknowledged">Sem confirmação</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <div>
            {noticeReadsQuery.isLoading ? (
              <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-8 text-center">
                <p className="text-sm text-slate-500">Carregando leituras...</p>
              </div>
            ) : noticeReadsQuery.isError ? (
              <Card className="border-slate-200/70 bg-white/80">
                <CardHeader>
                  <CardTitle>Endpoint não disponível</CardTitle>
                  <CardDescription>
                    O backend ainda não implementou o endpoint necessário para listar as leituras detalhadas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">Endpoint necessário:</p>
                    <code className="mt-2 block rounded bg-slate-800 px-3 py-2 font-mono text-xs text-slate-100">
                      GET /api/notices/{`{id}`}/readers
                    </code>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Parâmetros esperados:</p>
                    <ul className="list-inside list-disc space-y-1 pl-2">
                      <li>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">page</code> - Página atual (padrão: 1)
                      </li>
                      <li>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">per_page</code> - Registros por página (padrão: 20)
                      </li>
                      <li>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">search</code> - Busca por nome/email do usuário
                      </li>
                      <li>
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">acknowledged</code> - Filtro booleano (true/false)
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">Resposta esperada (paginada):</p>
                    <pre className="overflow-x-auto rounded bg-slate-800 p-3 font-mono text-xs text-slate-100">
{`{
  "data": [
    {
      "id": 1,
      "notice_id": 1,
      "user_id": 1,
      "has_acknowledged": true,
      "read_at": "2024-01-01T10:00:00",
      "acknowledged_at": "2024-01-01T10:05:00",
      "user": {
        "id": 1,
        "name": "Nome do Usuário",
        "email": "usuario@exemplo.com"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 20,
    "total": 1,
    "from": 1,
    "to": 1
  }
}`}
                    </pre>
                  </div>

                  <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Enquanto isso:</span> O resumo estatístico acima mostra o contador de leituras e o status do
                      usuário atual, que já estão disponíveis na API.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <NoticeReadTable reads={noticeReadsQuery.data?.data ?? []} />
                {noticeReadsQuery.data?.meta && noticeReadsQuery.data.meta.last_page > 1 ? (
                  <Pagination
                    currentPage={noticeReadsQuery.data.meta.current_page}
                    lastPage={noticeReadsQuery.data.meta.last_page}
                    total={noticeReadsQuery.data.meta.total}
                    from={noticeReadsQuery.data.meta.from}
                    to={noticeReadsQuery.data.meta.to}
                    onPageChange={setReadsPage}
                    isDisabled={noticeReadsQuery.isLoading}
                  />
                ) : null}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
