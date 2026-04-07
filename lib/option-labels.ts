import type { ArmamentItem } from "@/types/armament.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
import type { VehicleItem } from "@/types/vehicle.type";

function compactParts(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : part))
    .filter((part): part is string => Boolean(part));
}

export function formatVehicleOptionLabel(vehicle: Partial<VehicleItem> & { id: number }) {
  const model = compactParts([
    vehicle.variant?.brand?.name,
    vehicle.variant?.name,
  ]).join(" / ");

  const plates = compactParts([
    vehicle.license_plate,
    vehicle.special_plate ? `Esp.: ${vehicle.special_plate}` : null,
  ]).join(" • ");

  return compactParts([model, plates, !model && !plates ? `Veiculo #${vehicle.id}` : null]).join(" • ");
}

export function formatArmamentOptionLabel(armament: Partial<ArmamentItem> & { id: number }) {
  return compactParts([
    compactParts([armament.variant?.brand?.name, armament.variant?.name]).join(" / "),
    armament.caliber?.name ? `Cal.: ${armament.caliber.name}` : null,
    armament.size?.name ? `Tam.: ${armament.size.name}` : null,
    armament.gender?.name ? `Gen.: ${armament.gender.name}` : null,
    !armament.variant?.name && !armament.variant?.brand?.name && !armament.caliber?.name && !armament.size?.name && !armament.gender?.name
      ? `Armamento #${armament.id}`
      : null,
  ]).join(" • ");
}

export function formatPoliceOfficerOptionLabel(officer: Partial<PoliceOfficerItem> & { id: number }) {
  const rankLabel = officer.current_rank?.abbreviation || officer.current_rank?.name;
  const numeralLabel = officer.badge_number ? `Num.: ${officer.badge_number}` : null;
  const warName = officer.war_name || officer.name || officer.user?.name || `Policial #${officer.id}`;
  const registration = officer.registration_number ? `Mat.: ${officer.registration_number}` : null;

  return compactParts([rankLabel, numeralLabel, warName, registration]).join(" • ");
}
