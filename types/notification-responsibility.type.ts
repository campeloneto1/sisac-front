import type { PaginatedMeta } from "@/types/brand.type";
import type { SubunitItem } from "@/types/subunit.type";
import type { SectorItem } from "@/types/sector.type";

export const notificationResponsibilityDomains = [
  "vehicle",
  "armament",
  "material",
  "patrimony",
  "service",
  "ensino",
  "sargentiacao",
  "contract",
  "police_officer",
  "user",
] as const;

export type NotificationResponsibilityDomain = (typeof notificationResponsibilityDomains)[number];

export const notificationResponsibilityDomainLabels: Record<NotificationResponsibilityDomain, string> = {
  vehicle: "Veiculos",
  armament: "Armamentos",
  material: "Materiais",
  patrimony: "Patrimonios",
  service: "Servicos",
  ensino: "Ensino",
  sargentiacao: "Sargentiacao",
  contract: "Contratos",
  police_officer: "Policiais",
  user: "Usuarios",
};

export function getNotificationResponsibilityDomainLabel(domain: string) {
  return notificationResponsibilityDomainLabels[domain as NotificationResponsibilityDomain] ?? domain;
}

export interface NotificationResponsibilityItem {
  id: number;
  domain: NotificationResponsibilityDomain;
  subunit_id: number;
  sector_id: number;
  subunit?: Pick<SubunitItem, "id" | "name" | "abbreviation"> | null;
  sector?: Pick<SectorItem, "id" | "name" | "abbreviation" | "subunit_id"> | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
  updater?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationResponsibilityFilters {
  page?: number;
  per_page?: number;
  domain?: NotificationResponsibilityDomain;
  subunit_id?: number;
  sector_id?: number;
}

export interface CreateNotificationResponsibilityDTO {
  domain: NotificationResponsibilityDomain;
  subunit_id: number;
  sector_id: number;
}

export interface UpdateNotificationResponsibilityDTO {
  domain?: NotificationResponsibilityDomain;
  subunit_id?: number;
  sector_id?: number;
}

export interface NotificationResponsibilityResponse {
  message: string;
  data: NotificationResponsibilityItem;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
