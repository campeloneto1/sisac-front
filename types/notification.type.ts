import type { PaginatedMeta } from "@/types/brand.type";

export interface NotificationPayload {
  slug?: string | null;
  title?: string | null;
  message?: string | null;
  level?: string | null;
  module?: string | null;
  action_url?: string | null;
  metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  type?: string | null;
  title?: string | null;
  message?: string | null;
  level?: string | null;
  action_url?: string | null;
  data?: NotificationPayload | null;
  is_read: boolean;
  read_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationFilters {
  page?: number;
  per_page?: number;
  type?: string;
  read?: boolean | null;
}

export interface NotificationResponse {
  message: string;
  data: NotificationItem;
}

export interface PaginatedNotificationsResponse {
  data: NotificationItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export interface NotificationsUnreadCountResponse {
  message: string;
  data: {
    unread_count: number;
  };
}

export interface MarkAllNotificationsReadResponse {
  message: string;
  data: {
    marked_count: number;
  };
}

export function getNotificationLevelVariant(level?: string | null) {
  if (level === "success") {
    return "success" as const;
  }

  if (level === "warning") {
    return "warning" as const;
  }

  if (level === "danger" || level === "error") {
    return "danger" as const;
  }

  return "info" as const;
}
