"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BellRing, CalendarClock, Pin, ShieldCheck, UserCircle2, Users } from "lucide-react";

import { useSubunit } from "@/contexts/subunit-context";
import { useNotice } from "@/hooks/use-notices";
import { usePermissions } from "@/hooks/use-permissions";
import { useRoles } from "@/hooks/use-roles";
import { useSectors } from "@/hooks/use-sectors";
import { useUsers } from "@/hooks/use-users";
import {
  getNoticePriorityBadgeVariant,
  getNoticePriorityLabel,
  getNoticeStatusBadgeVariant,
  getNoticeStatusLabel,
  getNoticeTargetTypeLabel,
  getNoticeTypeBadgeVariant,
  getNoticeTypeLabel,
  getNoticeVisibilityLabel,
} from "@/types/notice.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function resolveTargetLabel(
  targetType: "all" | "sector" | "user" | "role",
  targetId: number | null,
  options: {
    sectors: Array<{ id: number; label: string }>;
    users: Array<{ id: number; label: string }>;
    roles: Array<{ id: number; label: string }>;
  },
) {
  if (targetType === "all") {
    return "Todos os usuários alcançados pela subunidade ativa";
  }

  if (targetType === "sector") {
    return options.sectors.find((sector) => sector.id === targetId)?.label ?? `Setor #${targetId}`;
  }

  if (targetType === "user") {
    return options.users.find((user) => user.id === targetId)?.label ?? `Usuário #${targetId}`;
  }

  return options.roles.find((role) => role.id === targetId)?.label ?? `Perfil #${targetId}`;
}

export function NoticeShowPage() {
  const { id } = useParams<{ id: string }>();
  const { activeSubunit } = useSubunit();
  const permissions = usePermissions("notices");
  const [activeTab, setActiveTab] = useState("summary");
  const noticeQuery = useNotice(id, Boolean(activeSubunit) && permissions.canView);
  const sectorsQuery = useSectors({ per_page: 100 }, Boolean(activeSubunit) && permissions.canView);
  const usersQuery = useUsers({ per_page: 100 });
  const rolesQuery = useRoles({ per_page: 100 });

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
  const activeSubunitId = Number(activeSubunit.id);
  const sectors = (sectorsQuery.data?.data ?? []).map((sector) => ({
    id: sector.id,
    label: sector.abbreviation ? `${sector.name} (${sector.abbreviation})` : sector.name,
  }));
  const users = (usersQuery.data?.data ?? [])
    .filter((user) => user.subunits?.some((subunit) => Number(subunit.id) === activeSubunitId))
    .map((user) => ({
      id: user.id,
      label: `${user.name} (${user.email})`,
    }));
  const roles = (rolesQuery.data?.data ?? []).map((role) => ({
    id: role.id,
    label: `${role.name} (${role.slug})`,
  }));

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

        <TabsContent value="targets">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader>
              <CardTitle>NoticeTarget</CardTitle>
              <CardDescription>
                Os destinatários do aviso são geridos como sub-recurso interno do `Notice`, respeitando a subunidade ativa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notice.targets?.length ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {notice.targets.map((target) => (
                      <Badge key={target.id} variant="outline" className="max-w-full whitespace-normal px-3 py-2">
                        {getNoticeTargetTypeLabel(target.target_type)}: {resolveTargetLabel(target.target_type, target.target_id, { sectors, users, roles })}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-slate-500">
                    Para alterar este conjunto de `NoticeTarget`, use a edição do aviso. A API atual trata targets dentro do payload de `Notice`.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">
                    Sem targets explícitos. O aviso está configurado como geral da subunidade ativa.
                  </p>
                  <p className="text-sm text-slate-500">
                    Se precisar segmentar por setor, usuário ou perfil, edite este aviso e adicione os destinatários no formulário.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reads">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="border-slate-200/70 bg-white/80">
              <CardHeader>
                <CardTitle>NoticeRead</CardTitle>
                <CardDescription>
                  O histórico de leitura e ciência é mantido como sub-recurso interno do aviso e atualizado pelas ações da API.
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
                <CardTitle>Limites atuais da API</CardTitle>
                <CardDescription>
                  A API atual expõe contadores e o status do usuário autenticado, mas ainda não retorna a lista completa de registros `NoticeRead`.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>
                  O fluxo operacional já existe por meio das ações `markAsRead` e `acknowledge`, então o sub-recurso faz parte do módulo `Notice`.
                </p>
                <p>
                  Para um CRUD administrativo completo de leituras, o backend ainda precisaria expor endpoints ou incluir a coleção detalhada no `NoticeResource`.
                </p>
                <p>
                  Enquanto isso, esta aba concentra o acompanhamento disponível hoje sem criar telas artificiais sem suporte real da API.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
