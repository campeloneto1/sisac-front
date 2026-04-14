import { useQuery } from "@tanstack/react-query";

import { enumsService } from "@/services/enums/service";

export function useNotificationDomains() {
  return useQuery({
    queryKey: ["enums", "notification-domains"],
    queryFn: () => enumsService.getNotificationDomains(),
    staleTime: 1000 * 60 * 60, // 1 hora - domínios não mudam frequentemente
  });
}
