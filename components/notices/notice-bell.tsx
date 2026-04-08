"use client";

import Link from "next/link";
import { BellRing, CheckCheck } from "lucide-react";

import { useAcknowledgeNoticeMutation, useMarkNoticeAsReadMutation } from "@/hooks/use-notice-mutations";
import { useMyNotices, useUnreadMyNoticesCount } from "@/hooks/use-notices";
import { getNoticePriorityBadgeVariant, getNoticePriorityLabel, getNoticeTypeBadgeVariant, getNoticeTypeLabel } from "@/types/notice.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

export function NoticeBell() {
  const unreadCountQuery = useUnreadMyNoticesCount();
  const myNoticesQuery = useMyNotices({ per_page: 6 }, true);
  const markAsReadMutation = useMarkNoticeAsReadMutation();
  const acknowledgeMutation = useAcknowledgeNoticeMutation();
  const unreadCount = unreadCountQuery.data ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="relative h-10 w-10 rounded-xl">
          <BellRing className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[420px] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Avisos</p>
            <p className="text-xs text-slate-500">
              {unreadCount > 0 ? `${unreadCount} aviso(s) não lido(s)` : "Nenhum aviso pendente"}
            </p>
          </div>
          <Button asChild type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Link href="/my-notices">
              <CheckCheck className="mr-1 h-4 w-4" />
              Ver todos
            </Link>
          </Button>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-[420px] overflow-y-auto p-2">
          {myNoticesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !myNoticesQuery.data?.data.length ? (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Nenhum aviso disponível para o seu contexto atual.
            </div>
          ) : (
            <div className="space-y-2">
              {myNoticesQuery.data.data.map((notice) => (
                <div
                  key={notice.id}
                  className={`rounded-2xl border px-3 py-3 ${
                    notice.has_read ? "border-slate-200/70 bg-white" : "border-sky-200 bg-sky-50/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                        {!notice.has_read ? <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> : null}
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-600">{notice.content}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getNoticeTypeBadgeVariant(notice.type)}>{getNoticeTypeLabel(notice.type)}</Badge>
                      <Badge variant={getNoticePriorityBadgeVariant(notice.priority)}>{getNoticePriorityLabel(notice.priority)}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">{formatDateTime(notice.created_at)}</span>
                    <div className="flex gap-2">
                      {!notice.has_read ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={markAsReadMutation.isPending}
                          onClick={() => void markAsReadMutation.mutateAsync(notice.id)}
                        >
                          Marcar lido
                        </Button>
                      ) : null}
                      {notice.requires_acknowledgement && !notice.has_acknowledged ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={acknowledgeMutation.isPending}
                          onClick={() => void acknowledgeMutation.mutateAsync(notice.id)}
                        >
                          Confirmar ciência
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="px-2">
            <Link href="/my-notices">Abrir caixa de avisos</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
