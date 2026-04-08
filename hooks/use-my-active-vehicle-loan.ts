"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { useSubunit } from "@/contexts/subunit-context";
import { vehicleLoansService } from "@/services/vehicle-loans/service";
import type { AuthUser } from "@/types/auth.type";
import type {
  VehicleLoanBorrowerType,
  VehicleLoanItem,
} from "@/types/vehicle-loan.type";

function getBorrowerTypes(user: AuthUser | null): VehicleLoanBorrowerType[] {
  const types = new Set<VehicleLoanBorrowerType>();

  if (user?.type === "App\\Models\\PoliceOfficer") {
    types.add("App\\Models\\PoliceOfficer");
  }

  types.add("App\\Models\\User");

  return Array.from(types);
}

async function findMyActiveVehicleLoan(user: AuthUser) {
  const borrowerTypes = getBorrowerTypes(user);

  for (const borrowerType of borrowerTypes) {
    const response = await vehicleLoansService.index({
      per_page: 10,
      status: "in_use",
      borrower_id: user.id,
      borrower_type: borrowerType,
    });

    const match =
      response.data.find(
        (loan) =>
          loan.borrower_id === user.id && loan.borrower_type === borrowerType,
      ) ?? null;

    if (match) {
      return match;
    }
  }

  const fallbackResponse = await vehicleLoansService.index({
    per_page: 50,
    status: "in_use",
    borrower_id: user.id,
  });

  return (
    fallbackResponse.data.find((loan) => loan.borrower_id === user.id) ?? null
  );
}

export function useMyActiveVehicleLoan(enabled = true) {
  const { user } = useAuth();
  const { activeSubunit } = useSubunit();

  return useQuery<VehicleLoanItem | null>({
    queryKey: [
      "vehicle-operations",
      "my-active-loan",
      activeSubunit?.id ?? null,
      user?.id ?? null,
      user?.type ?? null,
    ],
    queryFn: () => findMyActiveVehicleLoan(user as AuthUser),
    enabled: enabled && Boolean(user) && Boolean(activeSubunit),
  });
}

export function getAuthenticatedBorrowerType(
  user: AuthUser | null,
): VehicleLoanBorrowerType {
  if (user?.type === "App\\Models\\PoliceOfficer") {
    return "App\\Models\\PoliceOfficer";
  }

  return "App\\Models\\User";
}
