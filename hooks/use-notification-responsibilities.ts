"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { notificationResponsibilitiesService } from "@/services/notification-responsibilities/service";
import type { NotificationResponsibilityFilters } from "@/types/notification-responsibility.type";

export function useNotificationResponsibilities(filters: NotificationResponsibilityFilters, enabled = true) {
  return useQuery({
    queryKey: ["notification-responsibilities", filters],
    queryFn: () => notificationResponsibilitiesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useNotificationResponsibility(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["notification-responsibilities", id],
    queryFn: () => notificationResponsibilitiesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}
