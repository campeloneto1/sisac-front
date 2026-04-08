"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { resolveNotificationHref } from "@/lib/notification-routing";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "@/hooks/use-notification-mutations";
import { useNotifications } from "@/hooks/use-notifications";
import type { NotificationFilters } from "@/types/notification.type";
import { getNotificationLevelVariant } from "@/types/notification.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function NotificationsListPage() {
  const router = useRouter();
  const [type, setType] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [page, setPage] = useState(1);
  const notificationsFilters = useMemo<NotificationFilters>(
    () => ({
      page,
      per_page: 15,
      type: type || undefined,
      read:
        readFilter === "all"
          ? null
          : readFilter === "read"
            ? true
            : false,
    }),
    [page, readFilter, type],
  );
  const notificationsQuery = useNotifications(notificationsFilters);
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();

  async function handleOpen(notificationId: string, isRead: boolean) {
    if (!isRead) {
      await markAsReadMutation.mutateAsync(notificationId);
    }

    router.push(`/notifications/${notificationId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-3 text-primary shadow-sm">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Notificacoes
            </h1>
            <p className="text-sm text-slate-500">
              Acompanhe seus avisos do sistema e abra a origem quando houver rota
              disponível.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await markAllAsReadMutation.mutateAsync();
          }}
          disabled={markAllAsReadMutation.isPending}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          Marcar todas como lidas
        </Button>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardContent className="grid gap-3 pt-6 md:grid-cols-[1fr_220px]">
          <Input
            placeholder="Filtrar por tipo de notificação..."
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          />

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
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {notificationsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : notificationsQuery.isError ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Erro ao carregar notificações</CardTitle>
            <CardDescription>
              As notificações do usuário autenticado não estão disponíveis no
              momento.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !notificationsQuery.data?.data.length ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Nenhuma notificação encontrada</CardTitle>
            <CardDescription>
              Ajuste os filtros ou aguarde novas notificações do sistema.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {notificationsQuery.data.data.map((notification) => {
              const originHref = resolveNotificationHref(notification.action_url);

              return (
                <Card
                  key={notification.id}
                  className={
                    notification.is_read
                      ? "border-slate-200/70 bg-white/80"
                      : "border-sky-200 bg-sky-50/70"
                  }
                >
                  <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {notification.title || "Notificacao do sistema"}
                        </h2>
                        <Badge variant={getNotificationLevelVariant(notification.level)}>
                          {notification.level || "info"}
                        </Badge>
                        {!notification.is_read ? (
                          <Badge variant="info">Não lida</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-600">
                        {notification.message || "Sem detalhes adicionais."}
                      </p>
                      <p className="text-xs text-slate-500">
                        Tipo: {notification.type || "Não informado"} • Criada em{" "}
                        {formatDateTime(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          handleOpen(notification.id, notification.is_read)
                        }
                      >
                        Abrir detalhe
                      </Button>
                      {originHref ? (
                        <Button asChild variant="outline">
                          <Link href={originHref}>Ir para origem</Link>
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Pagination
            currentPage={notificationsQuery.data.meta.current_page}
            lastPage={notificationsQuery.data.meta.last_page}
            total={notificationsQuery.data.meta.total}
            from={notificationsQuery.data.meta.from}
            to={notificationsQuery.data.meta.to}
            onPageChange={setPage}
            isDisabled={notificationsQuery.isFetching}
          />
        </div>
      )}
    </div>
  );
}
