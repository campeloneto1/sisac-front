export const armamentUnitStatusOptions = [
  { value: "available", label: "Disponível", color: "green" },
  { value: "loaned", label: "Emprestado", color: "blue" },
  { value: "assigned", label: "Cedido", color: "purple" },
  { value: "maintenance", label: "Em manutenção", color: "yellow" },
  { value: "discharged", label: "Baixado", color: "gray" },
  { value: "lost", label: "Extraviado", color: "red" },
] as const;

export type ArmamentUnitStatus = (typeof armamentUnitStatusOptions)[number]["value"];

export function getArmamentUnitStatusLabel(value?: string | null) {
  return armamentUnitStatusOptions.find((option) => option.value === value)?.label ?? "Não informado";
}

export function getArmamentUnitBadgeVariant(
  color?: string | null,
): "danger" | "warning" | "info" | "success" | "outline" {
  switch (color) {
    case "red":
      return "danger";
    case "yellow":
      return "warning";
    case "blue":
    case "purple":
      return "info";
    case "green":
      return "success";
    default:
      return "outline";
  }
}
