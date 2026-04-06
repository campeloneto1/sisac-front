"use client";

import { PoliceOfficerRanksListPage } from "@/components/police-officer-ranks/list-page";
import { usePoliceOfficers } from "@/hooks/use-police-officers";
import { useRanks } from "@/hooks/use-ranks";

export default function PoliceOfficerRanksRoutePage() {
  const policeOfficersQuery = usePoliceOfficers({ per_page: 1000 });
  const ranksQuery = useRanks({ per_page: 1000 });

  const policeOfficers = policeOfficersQuery.data?.data.map((officer) => ({
    id: officer.id,
    name: officer.name,
    registration_number: officer.registration_number,
  })) ?? [];

  const ranks = ranksQuery.data?.data.map((rank) => ({
    id: rank.id,
    name: rank.name,
    abbreviation: rank.abbreviation,
  })) ?? [];

  return <PoliceOfficerRanksListPage policeOfficers={policeOfficers} ranks={ranks} />;
}
