export interface BrandVariantItem {
  id: number;
  brand_id: number;
  name: string;
  abbreviation?: string | null;
}

export interface BrandItem {
  id: number;
  name: string;
  abbreviation: string | null;
  type: BrandType;
  variants_count?: number | null;
  variants?: BrandVariantItem[];
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

export interface BrandFilters {
  page?: number;
  per_page?: number;
  search?: string;
  type?: BrandType | null;
}

export interface CreateBrandDTO {
  name: string;
  abbreviation?: string | null;
  type: BrandType;
}

export interface UpdateBrandDTO {
  name?: string;
  abbreviation?: string | null;
  type?: BrandType;
}

export interface BrandResponse {
  message: string;
  data: BrandItem;
}

export interface PaginatedMetaLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginatedMetaLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
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

export const brandTypeOptions = [
  { value: "weapon", label: "Armamento" },
  { value: "logistics", label: "Logística" },
  { value: "transport", label: "Transporte" },
] as const;

export type BrandType = (typeof brandTypeOptions)[number]["value"];

export function getBrandTypeLabel(type: BrandType | string | null | undefined) {
  return brandTypeOptions.find((option) => option.value === type)?.label ?? "Não informado";
}
