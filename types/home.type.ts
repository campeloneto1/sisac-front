export interface HomeMetricSection {
  total_registered?: number;
  active?: number;
  inactive?: number;
  on_leave?: number;
  medical_leaves?: number;
  pending_copem?: number;
  vacations_active?: number;
  vacations_expired?: number;
  available?: number;
  in_use?: number;
  maintenance?: number;
  custody?: number;
  decommissioned?: number;
  active_loans?: number;
  active_custodies?: number;
  total_units?: number;
  available_units?: number;
  loaned_units?: number;
  assigned_units?: number;
  maintenance_units?: number;
  critical_occurrences?: number;
  expiring_units_30_days?: number;
  expired?: number;
  suspended?: number;
  closed?: number;
  expiring_30_days?: number;
  budget_risk_90_plus?: number;
  budget_risk_100_plus?: number;
  pending_alerts?: number;
  critical_alerts?: number;
}

export interface HomePoliceOfficerSectorItem {
  sector?: {
    id: number | null;
    name: string;
    abbreviation?: string | null;
  } | null;
  total_officers: number;
  active_officers: number;
  inactive_officers: number;
}

export interface HomePoliceOfficerRankDistributionItem {
  rank?: {
    id: number | null;
    name: string;
    abbreviation?: string | null;
    hierarchy_level?: number | null;
  } | null;
  total_officers: number;
  active_officers: number;
}

export interface HomeVehicleFleetStatusItem {
  status: {
    operational_status: string;
    operational_status_label: string;
    ownership_type: string;
    ownership_type_label: string;
  };
  total_vehicles: number;
  armored_vehicles: number;
  travel_ready_vehicles: number;
}

export interface HomeVehicleFleetCompositionItem {
  type?: {
    id: number | null;
    name: string;
  } | null;
  variant?: {
    id: number | null;
    name: string;
  } | null;
  total_vehicles: number;
  active_vehicles: number;
  owned_vehicles: number;
  rented_vehicles: number;
}

export interface HomeArmamentAvailabilityItem {
  status: string;
  label: string;
  total_units: number;
  color?: string | null;
}

export interface HomeArmamentInventoryItem {
  armament?: {
    id: number;
    type?: string | null;
    variant?: string | null;
    caliber?: string | null;
    size?: string | null;
  } | null;
  total_units: number;
  available_units: number;
  loaned_units: number;
  assigned_units: number;
  maintenance_units: number;
  discharged_units: number;
  lost_units: number;
  total_batches_quantity: number;
  available_batches_quantity: number;
}

export interface HomeArmamentExpiringUnitItem {
  id: number;
  serial_number?: string | null;
  acquisition_date?: string | null;
  expiration_date?: string | null;
  days_until_expiration?: number | null;
  status?: {
    value: string;
    label: string;
    color?: string | null;
  } | null;
  armament?: {
    id: number;
    type?: string | null;
    variant?: string | null;
    brand?: string | null;
    caliber?: string | null;
    size?: string | null;
    subunit?: {
      id: number;
      name: string;
      abbreviation?: string | null;
    } | null;
  } | null;
}

export interface HomePoliceOfficersSection {
  summary: HomeMetricSection;
  by_sector: HomePoliceOfficerSectorItem[];
  rank_distribution: HomePoliceOfficerRankDistributionItem[];
}

export interface HomeVehiclesSection {
  summary: HomeMetricSection;
  fleet_status: HomeVehicleFleetStatusItem[];
  fleet_composition: HomeVehicleFleetCompositionItem[];
}

export interface HomeArmamentsSection {
  summary: HomeMetricSection;
  availability: HomeArmamentAvailabilityItem[];
  inventory: HomeArmamentInventoryItem[];
  expiring_units: HomeArmamentExpiringUnitItem[];
}

export interface HomeContractStatusOverviewItem {
  status: {
    value: string;
    label: string;
    color?: string | null;
  };
  total_contracts: number;
  total_value?: number | null;
  executed_amount?: number | null;
}

export interface HomeContractExecutionOverviewItem {
  company: {
    id: number | null;
    name: string;
  };
  total_contracts: number;
  total_value?: number | null;
  executed_amount?: number | null;
  remaining_amount?: number | null;
  executed_percentage?: number | null;
}

export interface HomeExpiringContractItem {
  id: number;
  contract_number: string;
  company?: string | null;
  end_date?: string | null;
  days_until_end?: number | null;
  executed_percentage?: number | null;
  status?: {
    value: string;
    label: string;
    color?: string | null;
  } | null;
}

export interface HomeBudgetRiskContractItem {
  id: number;
  contract_number: string;
  company?: string | null;
  total_value?: number | null;
  executed_amount?: number | null;
  remaining_amount?: number | null;
  executed_percentage?: number | null;
  end_date?: string | null;
  status?: {
    value: string;
    label: string;
    color?: string | null;
  } | null;
}

export interface HomeCriticalContractAlertItem {
  id: number;
  message: string;
  alert_date?: string | null;
  type?: {
    value: string;
    label: string;
    color?: string | null;
    priority?: number | null;
  } | null;
  contract?: {
    id: number;
    contract_number: string;
    company?: string | null;
  } | null;
}

export interface HomeContractsSection {
  summary: HomeMetricSection;
  status_overview: HomeContractStatusOverviewItem[];
  execution_overview: HomeContractExecutionOverviewItem[];
  expiring_contracts: HomeExpiringContractItem[];
  budget_risk_contracts: HomeBudgetRiskContractItem[];
  critical_alerts: HomeCriticalContractAlertItem[];
}

export interface HomeData {
  generated_at: string;
  active_subunit_id?: number | null;
  police_officers?: HomePoliceOfficersSection | null;
  vehicles?: HomeVehiclesSection | null;
  armaments?: HomeArmamentsSection | null;
  contracts?: HomeContractsSection | null;
}

export interface HomeResponse {
  message: string;
  data: HomeData;
}
