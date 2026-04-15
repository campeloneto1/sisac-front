"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { policeOfficersService } from "@/services/police-officers/service";
import type { PoliceOfficerFilters } from "@/types/police-officer.type";

export function usePoliceOfficers(filters: PoliceOfficerFilters) {
  return useQuery({
    queryKey: ["police-officers", filters],
    queryFn: () => policeOfficersService.index(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePoliceOfficer(id: number | string) {
  return useQuery({
    queryKey: ["police-officers", id],
    queryFn: () => policeOfficersService.show(id),
    enabled: Boolean(id),
  });
}

export function usePoliceOfficerBanks(search?: string) {
  return useQuery({
    queryKey: ["police-officer-banks", search ?? ""],
    queryFn: () => policeOfficersService.banks(search),
  });
}

export function usePoliceOfficerCities(search?: string) {
  return useQuery({
    queryKey: ["police-officer-cities", search ?? ""],
    queryFn: () => policeOfficersService.cities(search),
  });
}

export function usePoliceOfficerGenders(search?: string) {
  return useQuery({
    queryKey: ["police-officer-genders", search ?? ""],
    queryFn: () => policeOfficersService.genders(search),
  });
}

export function usePoliceOfficerEducationLevels(search?: string) {
  return useQuery({
    queryKey: ["police-officer-education-levels", search ?? ""],
    queryFn: () => policeOfficersService.educationLevels(search),
  });
}

export function usePoliceOfficerRoles(search?: string) {
  return useQuery({
    queryKey: ["police-officer-roles", search ?? ""],
    queryFn: () => policeOfficersService.roles(search),
  });
}

export function usePoliceOfficerSectors(search?: string) {
  return useQuery({
    queryKey: ["police-officer-sectors", search ?? ""],
    queryFn: () => policeOfficersService.sectors(search),
  });
}

export function usePoliceOfficerRanks(search?: string) {
  return useQuery({
    queryKey: ["police-officer-ranks", search ?? ""],
    queryFn: () => policeOfficersService.ranks(search),
  });
}

export function usePoliceOfficerAssignments(search?: string) {
  return useQuery({
    queryKey: ["police-officer-assignments", search ?? ""],
    queryFn: () => policeOfficersService.assignments(search),
  });
}
