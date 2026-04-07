import type { PoliceOfficerItem } from "./police-officer.type";
import type { PublicationTypeItem } from "./publication-type.type";

export interface PoliceOfficerPublicationItem {
  id: number;
  police_officer_id: number;
  publication_type_id?: number | null;
  content: string;
  bulletin: string;
  publication_date?: string | null;
  external_link?: string | null;
  police_officer?: PoliceOfficerItem | null;
  publication_type?: PublicationTypeItem | null;
  creator?: { id: number; name: string; email: string } | null;
  updater?: { id: number; name: string; email: string } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PoliceOfficerPublicationFilters {
  page?: number;
  per_page?: number;
  search?: string;
  police_officer_id?: number;
  publication_type_id?: number;
  publication_date_from?: string;
  publication_date_to?: string;
}

export interface CreatePoliceOfficerPublicationDTO {
  police_officer_id: number;
  publication_type_id?: number | null;
  content: string;
  bulletin: string;
  publication_date: string;
  external_link?: string | null;
}

export type UpdatePoliceOfficerPublicationDTO =
  Partial<CreatePoliceOfficerPublicationDTO>;

export interface PoliceOfficerPublicationResponse {
  message: string;
  data: PoliceOfficerPublicationItem;
}

export interface PaginatedPoliceOfficerPublicationResponse {
  data: PoliceOfficerPublicationItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}
