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
  "sargentiação",
  "contract",
  "police_officer",
  "user",
] as const;

export type NotificationResponsibilityDomain = (typeof notificationResponsibilityDomains)[number];

export const notificationResponsibilityDomainLabels: Record<NotificationResponsibilityDomain, string> = {
  vehicle: "Veículos",
  armament: "Armamentos",
  material: "Materiais",
  patrimony: "Patrimônios",
  service: "Serviços",
  ensino: "Ensino",
  sargentiação: "Sargentiação",
  contract: "Contratos",
  police_officer: "Policiais",
  user: "Usuários",
};

export function getNotificationResponsibilityDomainLabel(domain: string) {
  return notificationResponsibilityDomainLabels[domain as NotificationResponsibilityDomain] ?? domain;
}

// Novos types para o endpoint de domínios dinâmicos
export interface NotificationDomainOption {
  value: string;
  label: string;
  color: string;
  description: string;
}

export interface NotificationDomainsResponse {
  message: string;
  data: NotificationDomainOption[];
}

export interface NotificationResponsibilityItem {
  id: number;
  domain: NotificationResponsibilityDomain | {
    value: string;
    label: string;
    color: string;
  };
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

// Helper para extrair o valor do domínio (compatível com ambos os formatos)
export function getDomainValue(domain: NotificationResponsibilityItem["domain"]): string {
  return typeof domain === "string" ? domain : domain.value;
}

// Helper para extrair o label do domínio (compatível com ambos os formatos)
export function getDomainLabel(domain: NotificationResponsibilityItem["domain"]): string {
  if (typeof domain === "string") {
    return getNotificationResponsibilityDomainLabel(domain);
  }
  return domain.label;
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
  sector_id: number;
}

export interface UpdateNotificationResponsibilityDTO {
  domain?: NotificationResponsibilityDomain;
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
