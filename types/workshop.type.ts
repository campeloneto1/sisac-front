import type { PaginatedMeta } from "@/types/brand.type";

export type WorkshopStatus = "active" | "inactive";

export interface WorkshopUser {
  id: number;
  name: string;
  email: string;
}

export interface WorkshopItem {
  id: number;
  name: string;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  specialties?: string[] | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  status: WorkshopStatus;
  status_label?: string | null;
  status_color?: string | null;
  is_active: boolean;
  notes?: string | null;
  creator?: WorkshopUser | null;
  updater?: WorkshopUser | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WorkshopFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: WorkshopStatus;
  city?: string;
  state?: string;
  specialty?: string;
}

export interface CreateWorkshopDTO {
  name: string;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  specialties?: string[] | null;
  contact_person?: string | null;
  contact_phone?: string | null;
  status?: WorkshopStatus;
  notes?: string | null;
}

export interface UpdateWorkshopDTO extends Partial<CreateWorkshopDTO> {}

export interface WorkshopResponse {
  message: string;
  data: WorkshopItem;
}

export interface PaginatedWorkshopsResponse {
  data: WorkshopItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}

export const workshopStatusOptions: Array<{
  value: WorkshopStatus;
  label: string;
}> = [
  { value: "active", label: "Ativa" },
  { value: "inactive", label: "Inativa" },
];
