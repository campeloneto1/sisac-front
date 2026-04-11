"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { noticesService, type PublicNoticeFilters } from "@/services/notices/service";
import type { MyNoticeFilters, NoticeFilters, NoticeReadFilters, NoticeTargetFilters } from "@/types/notice.type";

export function usePublicNotices(filters: PublicNoticeFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["public-notices", filters],
    queryFn: () => noticesService.publicNotices(filters),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useNotices(filters: NoticeFilters, enabled = true) {
  return useQuery({
    queryKey: ["notices", filters],
    queryFn: () => noticesService.index(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useNotice(id: number | string, enabled = true) {
  return useQuery({
    queryKey: ["notices", id],
    queryFn: () => noticesService.show(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useMyNotices(filters: MyNoticeFilters, enabled = true) {
  return useQuery({
    queryKey: ["my-notices", filters],
    queryFn: () => noticesService.myNotices(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useUnreadMyNoticesCount(enabled = true) {
  return useQuery({
    queryKey: ["my-notices", "unread-count"],
    queryFn: async () => {
      const response = await noticesService.myNotices({
        per_page: 1,
        read: false,
      });

      return response.meta.total;
    },
    enabled,
    refetchInterval: 60_000,
  });
}

export function useNoticeReads(noticeId: number | string, filters: NoticeReadFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["notices", noticeId, "reads", filters],
    queryFn: () => noticesService.reads(noticeId, filters),
    enabled: Boolean(noticeId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useNoticeTargets(noticeId: number | string, filters: NoticeTargetFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["notices", noticeId, "targets", filters],
    queryFn: () => noticesService.targets(noticeId, filters),
    enabled: Boolean(noticeId) && enabled,
    placeholderData: keepPreviousData,
  });
}
