function compactParts(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : part))
    .filter((part): part is string => Boolean(part));
}

interface VehicleOptionShape {
  id: number;
  license_plate?: string | null;
  special_plate?: string | null;
  variant?: {
    name?: string | null;
    brand?: {
      name?: string | null;
    } | null;
  } | null;
}

interface ArmamentOptionShape {
  id: number;
  variant?: {
    name?: string | null;
    brand?: {
      name?: string | null;
    } | null;
  } | null;
  caliber?: {
    name?: string | null;
  } | null;
  size?: {
    name?: string | null;
  } | null;
  gender?: {
    name?: string | null;
  } | null;
}

interface MaterialOptionShape {
  id: number;
  type?: {
    name?: string | null;
  } | null;
  variant?: {
    name?: string | null;
    brand?: {
      name?: string | null;
    } | null;
  } | null;
}

interface PoliceOfficerOptionShape {
  id: number;
  name?: string | null;
  war_name?: string | null;
  registration_number?: string | null;
  badge_number?: string | null;
  user?: {
    name?: string | null;
  } | null;
  current_rank?: {
    name?: string | null;
    abbreviation?: string | null;
  } | null;
}

export function formatVehicleOptionLabel(vehicle: VehicleOptionShape) {
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

export function formatArmamentOptionLabel(armament: ArmamentOptionShape) {
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

export function formatMaterialOptionLabel(material: MaterialOptionShape) {
  return compactParts([
    material.type?.name,
    compactParts([material.variant?.brand?.name, material.variant?.name]).join(
      " / ",
    ),
    !material.type?.name && !material.variant?.name && !material.variant?.brand?.name
      ? `Material #${material.id}`
      : null,
  ]).join(" • ");
}

export function formatPoliceOfficerOptionLabel(officer: PoliceOfficerOptionShape) {
  const rankLabel = officer.current_rank?.abbreviation || officer.current_rank?.name;
  const numeralLabel = officer.badge_number ? `Num.: ${officer.badge_number}` : null;
  const warName = officer.war_name || officer.name || officer.user?.name || `Policial #${officer.id}`;
  const registration = officer.registration_number ? `Mat.: ${officer.registration_number}` : null;

  return compactParts([rankLabel, numeralLabel, warName, registration]).join(" • ");
}
