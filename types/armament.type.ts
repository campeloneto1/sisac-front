import type { PaginatedMeta } from "@/types/brand.type";
import type { ArmamentCaliberItem } from "@/types/armament-caliber.type";
import type { ArmamentSizeItem } from "@/types/armament-size.type";
import type { ArmamentTypeItem } from "@/types/armament-type.type";
import type { GenderItem } from "@/types/gender.type";
import type { SubunitItem } from "@/types/subunit.type";
import type { VariantItem } from "@/types/variant.type";

export type ArmamentSpecifications = Record<string, string>;

export interface ArmamentItem {
  id: number;
  subunit_id?: number | null;
  armament_type_id: number;
  variant_id: number;
  armament_caliber_id?: number | null;
  armament_size_id?: number | null;
  gender_id?: number | null;
  specifications?: ArmamentSpecifications | null;
  subunit?: Pick<SubunitItem, "id" | "name" | "abbreviation"> | null;
  type?: Pick<ArmamentTypeItem, "id" | "name" | "slug" | "control_type"> | null;
  variant?: VariantItem | null;
  caliber?: Pick<ArmamentCaliberItem, "id" | "name" | "slug"> | null;
  size?: Pick<ArmamentSizeItem, "id" | "name" | "slug"> | null;
  gender?: Pick<GenderItem, "id" | "name"> | null;
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
  deleted_at?: string | null;
}

export interface ArmamentFilters {
  page?: number;
  per_page?: number;
  search?: string;
  subunit_id?: number | null;
  armament_type_id?: number | null;
  variant_id?: number | null;
  armament_caliber_id?: number | null;
  armament_size_id?: number | null;
  gender_id?: number | null;
}

export interface CreateArmamentDTO {
  subunit_id?: number | null;
  armament_type_id: number;
  variant_id: number;
  armament_caliber_id?: number | null;
  armament_size_id?: number | null;
  gender_id?: number | null;
  specifications?: ArmamentSpecifications | null;
}

export type UpdateArmamentDTO = Partial<CreateArmamentDTO>;

export interface ArmamentResponse {
  message: string;
  data: ArmamentItem;
}

export interface PaginatedArmamentsResponse {
  data: ArmamentItem[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: PaginatedMeta;
}
