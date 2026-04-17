export type SearchModule =
  | "contracts"
  | "services"
  | "vehicles"
  | "armaments"
  | "police-officers"
  | "patrimonies"
  | "vehicle-loans"
  | "armament-loans"
  | "material-loans";

export interface SearchResult {
  id: number;
  module: SearchModule;
  module_label: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string | null;
  status_label: string | null;
  url: string;
  icon: string;
}

export interface GlobalSearchFilters {
  query: string;
  limit?: number;
  modules?: SearchModule[];
}

export interface GlobalSearchResponse {
  message: string;
  data: {
    query: string;
    total: number;
    results: SearchResult[];
  };
}
