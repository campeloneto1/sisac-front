"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";

import { resolveNotificationHref } from "@/lib/notification-routing";
import { useMarkNotificationAsReadMutation } from "@/hooks/use-notification-mutations";
import { useNotification } from "@/hooks/use-notifications";
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
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Nao informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationDetailPage() {
  const params = useParams<{ id: string }>();
  const notificationQuery = useNotification(params.id);
  const markAsReadMutation = useMarkNotificationAsReadMutation();
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    const notification = notificationQuery.data?.data;

    if (!notification || notification.is_read || hasMarkedRef.current) {
      return;
    }

    hasMarkedRef.current = true;
    void markAsReadMutation.mutateAsync(notification.id);
  }, [markAsReadMutation, notificationQuery.data?.data]);

  if (notificationQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (notificationQuery.isError || !notificationQuery.data?.data) {
    return (
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Erro ao carregar notificacao</CardTitle>
          <CardDescription>
            Essa notificacao nao esta disponivel para o usuario autenticado.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const notification = notificationQuery.data.data;
  const originHref = resolveNotificationHref(notification.action_url);
  const metadata = notification.data?.metadata;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200/70 bg-white/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-slate-900">
              {notification.title || "Notificacao do sistema"}
            </h1>
            <Badge variant={getNotificationLevelVariant(notification.level)}>
              {notification.level || "info"}
            </Badge>
            {notification.is_read ? (
              <Badge variant="secondary">Lida</Badge>
            ) : (
              <Badge variant="info">Nao lida</Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Tipo: {notification.type || "Nao informado"} • Criada em{" "}
            {formatDateTime(notification.created_at)}
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/notifications">Voltar</Link>
          </Button>
          {originHref ? (
            <Button asChild>
              <Link href={originHref}>Ir para origem</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Mensagem</CardTitle>
          <CardDescription>
            Conteudo principal enviado pelo backend para esta notificacao.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
            <Bell className="mt-0.5 h-4 w-4 text-primary" />
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {notification.message || "Sem mensagem adicional."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Leitura
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {notification.is_read ? "Lida" : "Nao lida"}
              </p>
              <p className="text-sm text-slate-500">
                {notification.read_at
                  ? `Marcada em ${formatDateTime(notification.read_at)}`
                  : "Ainda nao foi marcada como lida."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Atualizacao
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {formatDateTime(notification.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Origem e payload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Link de origem
              </p>
              <p className="mt-1 break-all text-sm text-slate-700">
                {notification.action_url || "Nao informado"}
              </p>
              <p className="text-sm text-slate-500">
                {originHref
                  ? `Rota resolvida no frontend: ${originHref}`
                  : "Sem rota conhecida para navegacao automatica."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Slug / modulo
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {String(notification.data?.slug || "Nao informado")}
              </p>
              <p className="text-sm text-slate-500">
                {String(notification.data?.module || "Modulo nao informado")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {metadata ? (
        <Card className="border-slate-200/70 bg-white/80">
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
            <CardDescription>
              Contexto complementar enviado no payload da notificacao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-xs text-slate-700">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {!notification.is_read ? (
        <Card className="border-sky-200 bg-sky-50/70">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-sky-900">
            <CheckCheck className="h-4 w-4" />
            Esta notificacao sera marcada como lida automaticamente ao abrir.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
