import { api } from "@/lib/api";
import type { ApiMessageResponse } from "@/types/auth.type";
import type {
  CreateNoticeDTO,
  MyNoticeFilters,
  NoticeFilters,
  NoticeItem,
  NoticeResponse,
  PaginatedResponse,
  UpdateNoticeDTO,
} from "@/types/notice.type";

export const noticesService = {
  async index(filters: NoticeFilters = {}): Promise<PaginatedResponse<NoticeItem>> {
    const { data } = await api.get<PaginatedResponse<NoticeItem>>("/notices", {
      params: filters,
    });

    return data;
  },
  async show(id: number | string): Promise<NoticeResponse> {
    const { data } = await api.get<NoticeResponse>(`/notices/${id}`);

    return data;
  },
  async myNotices(filters: MyNoticeFilters = {}): Promise<PaginatedResponse<NoticeItem>> {
    const { data } = await api.get<PaginatedResponse<NoticeItem>>("/my-notices", {
      params: filters,
    });

    return data;
  },
  async create(payload: CreateNoticeDTO): Promise<NoticeResponse> {
    const { data } = await api.post<NoticeResponse>("/notices", payload);

    return data;
  },
  async update(id: number | string, payload: UpdateNoticeDTO): Promise<NoticeResponse> {
    const { data } = await api.put<NoticeResponse>(`/notices/${id}`, payload);

    return data;
  },
  async remove(id: number | string): Promise<ApiMessageResponse> {
    const { data } = await api.delete<ApiMessageResponse>(`/notices/${id}`);

    return data;
  },
  async markAsRead(id: number | string): Promise<NoticeResponse> {
    const { data } = await api.post<NoticeResponse>(`/notices/${id}/read`);

    return data;
  },
  async acknowledge(id: number | string): Promise<NoticeResponse> {
    const { data } = await api.post<NoticeResponse>(`/notices/${id}/acknowledge`);

    return data;
  },
};
