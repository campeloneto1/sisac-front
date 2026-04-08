export type MaterialOccurrenceType = "loss" | "damage" | "discharge" | "theft";
export type MaterialOccurrenceStatus =
  | "reported"
  | "investigating"
  | "resolved"
  | "closed";

export const materialOccurrenceTypeOptions: Array<{
  value: MaterialOccurrenceType;
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  requiresReport: boolean;
}> = [
  {
    value: "loss",
    label: "Extravio",
    severity: "high",
    requiresReport: true,
  },
  {
    value: "damage",
    label: "Dano",
    severity: "medium",
    requiresReport: false,
  },
  {
    value: "discharge",
    label: "Baixa",
    severity: "low",
    requiresReport: false,
  },
  {
    value: "theft",
    label: "Furto/Roubo",
    severity: "critical",
    requiresReport: true,
  },
];

export const materialOccurrenceStatusOptions: Array<{
  value: MaterialOccurrenceStatus;
  label: string;
}> = [
  { value: "reported", label: "Reportado" },
  { value: "investigating", label: "Em investigação" },
  { value: "resolved", label: "Resolvido" },
  { value: "closed", label: "Encerrado" },
];

export function getMaterialOccurrenceSeverityVariant(
  severity: "low" | "medium" | "high" | "critical",
) {
  if (severity === "critical") {
    return "danger" as const;
  }

  if (severity === "high") {
    return "warning" as const;
  }

  if (severity === "medium") {
    return "info" as const;
  }

  return "secondary" as const;
}

export function getMaterialOccurrenceStatusVariant(
  status: MaterialOccurrenceStatus,
) {
  if (status === "reported") {
    return "warning" as const;
  }

  if (status === "investigating") {
    return "info" as const;
  }

  if (status === "resolved") {
    return "success" as const;
  }

  return "secondary" as const;
}
