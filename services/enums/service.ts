import { api } from "@/lib/api";
import type { NotificationDomainsResponse } from "@/types/notification-responsibility.type";

export const enumsService = {
  async getNotificationDomains(): Promise<NotificationDomainsResponse> {
    const { data } = await api.get<NotificationDomainsResponse>("/enums/notification-domains", {
      skipSubunit: true,
    });

    return data;
  },
};
