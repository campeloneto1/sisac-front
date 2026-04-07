import type { PaginatedMeta } from "@/types/brand.type";

export const contractBillingModels = ["daily_usage", "monthly_fixed"] as const;

export type ContractBillingModel = (typeof contractBillingModels)[number];

export const contractBillingModelLabels: Record<ContractBillingModel, string> = {
  daily_usage: "Por utilizacao diaria",
  monthly_fixed: "Valor fixo mensal",
};

export const contractBillingModelDescriptions: Record<ContractBillingModel, string> = {
  daily_usage: "Contrato medido por uso, normalmente por diaria.",
  monthly_fixed: "Contrato pago por valor fixo recorrente mensal.",
};

export function getContractBillingModelLabel(model: string) {
  return contractBillingModelLabels[model as ContractBillingModel] ?? model;
}

export function getContractBillingModelDescription(model: string) {
  return contractBillingModelDescriptions[model as ContractBillingModel] ?? "Sem descricao disponivel.";
}

export interface ContractTypeFeatureItem {
  id: number;
  name: string;
}

export interface ContractTypeItem {
  id: number;
  name: string;
  billing_model: ContractBillingModel;
  billing_model_label?: string | null;
  billing_model_description?: string | null;
  features?: ContractTypeFeatureItem[];
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

export interface ContractTypeFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateContractTypeDTO {
  name: string;
  billing_model: ContractBillingModel;
}

export interface UpdateContractTypeDTO {
  name?: string;
  billing_model?: ContractBillingModel;
}

export interface ContractTypeResponse {
  message: string;
  data: ContractTypeItem;
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
