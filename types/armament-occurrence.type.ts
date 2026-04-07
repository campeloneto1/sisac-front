export type ArmamentOccurrenceType = "loss" | "damage" | "discharge" | "theft";
export type ArmamentOccurrenceStatus =
  | "reported"
  | "investigating"
  | "resolved"
  | "closed";

export const armamentOccurrenceTypeOptions: Array<{
  value: ArmamentOccurrenceType;
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

export const armamentOccurrenceStatusOptions: Array<{
  value: ArmamentOccurrenceStatus;
  label: string;
}> = [
  { value: "reported", label: "Reportado" },
  { value: "investigating", label: "Em investigacao" },
  { value: "resolved", label: "Resolvido" },
  { value: "closed", label: "Encerrado" },
];

export function getArmamentOccurrenceSeverityVariant(
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

export function getArmamentOccurrenceStatusVariant(
  status: ArmamentOccurrenceStatus,
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
