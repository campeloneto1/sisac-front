"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import { resolveNotificationHref } from "@/lib/notification-routing";
import { useMarkAllNotificationsAsReadMutation, useMarkNotificationAsReadMutation } from "@/hooks/use-notification-mutations";
import { useNotifications, useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { getNotificationLevelVariant } from "@/types/notification.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationBell() {
  const router = useRouter();
  const unreadCountQuery = useUnreadNotificationsCount();
  const notificationsQuery = useNotifications({ per_page: 6 });
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();
  const unreadCount = unreadCountQuery.data?.data.unread_count ?? 0;

  async function handleOpenNotification(
    notificationId: string,
    isRead: boolean,
  ) {
    if (!isRead) {
      await markAsReadMutation.mutateAsync(notificationId);
    }

    router.push(`/notifications/${notificationId}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="relative h-10 w-10 rounded-xl"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Notificacoes</p>
            <p className="text-xs text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} não lida(s)`
                : "Tudo em dia por aqui"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            onClick={async () => {
              await markAllAsReadMutation.mutateAsync();
            }}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Ler todas
          </Button>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-[420px] overflow-y-auto p-2">
          {notificationsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !notificationsQuery.data?.data.length ? (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Nenhuma notificação encontrada.
            </div>
          ) : (
            <div className="space-y-2">
              {notificationsQuery.data.data.map((notification) => {
                const originHref = resolveNotificationHref(notification.action_url);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleOpenNotification(notification.id, notification.is_read)
                    }
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      notification.is_read
                        ? "border-slate-200/70 bg-white hover:bg-slate-50"
                        : "border-sky-200 bg-sky-50/80 hover:bg-sky-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">
                            {notification.title || "Notificacao do sistema"}
                          </p>
                          {!notification.is_read ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-sm text-slate-600">
                          {notification.message || "Sem detalhes adicionais."}
                        </p>
                      </div>
                      <Badge variant={getNotificationLevelVariant(notification.level)}>
                        {notification.level || "info"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {formatDateTime(notification.created_at)}
                      </span>
                      {originHref ? (
                        <span className="text-xs font-medium text-primary">
                          Origem disponível
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="px-2">
            <Link href="/notifications">Ver todas</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
