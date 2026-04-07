"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { notificationsService } from "@/services/notifications/service";
import type { NotificationFilters } from "@/types/notification.type";

export function useNotifications(filters: NotificationFilters) {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => notificationsService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: ["notifications", id],
    queryFn: () => notificationsService.show(id),
    enabled: Boolean(id),
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsService.unreadCount(),
    refetchInterval: 60_000,
  });
}
