"use client";

import { Search, X } from "lucide-react";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COURSE_ENROLLMENT_STATUS_OPTIONS } from "@/types/course-enrollment.type";
import type { CourseItem } from "@/types/course.type";
import type { PoliceOfficerItem } from "@/types/police-officer.type";

interface ExternalCourseEnrollmentsFiltersProps {
  search: string;
  status: string;
  courseId: string;
  policeOfficerId: string;
  courses: CourseItem[];
  policeOfficers: PoliceOfficerItem[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCourseIdChange: (value: string) => void;
  onPoliceOfficerIdChange: (value: string) => void;
  onClear: () => void;
}

export function ExternalCourseEnrollmentsFilters({
  search,
  status,
  courseId,
  policeOfficerId,
  courses,
  policeOfficers,
  onSearchChange,
  onStatusChange,
  onCourseIdChange,
  onPoliceOfficerIdChange,
  onClear,
}: ExternalCourseEnrollmentsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 xl:grid-cols-[1.3fr_0.9fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por policial, curso, boletim ou certificado"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <SearchableSelect
        value={status}
        onValueChange={onStatusChange}
        placeholder="Todos os status"
        searchPlaceholder="Buscar status"
        options={[
          { value: "all", label: "Todos os status" },
          ...COURSE_ENROLLMENT_STATUS_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
            keywords: [option.value],
          })),
        ]}
      />

      <SearchableSelect
        value={courseId}
        onValueChange={onCourseIdChange}
        placeholder="Todos os cursos"
        searchPlaceholder="Buscar curso"
        options={[
          { value: "all", label: "Todos os cursos" },
          ...courses.map((course) => ({
            value: String(course.id),
            label: `${course.name}${course.abbreviation ? ` (${course.abbreviation})` : ""}`,
            keywords: [course.abbreviation, course.name].filter(Boolean) as string[],
          })),
        ]}
      />

      <SearchableSelect
        value={policeOfficerId}
        onValueChange={onPoliceOfficerIdChange}
        placeholder="Todos os policiais"
        searchPlaceholder="Buscar policial"
        options={[
          { value: "all", label: "Todos os policiais" },
          ...policeOfficers.map((officer) => ({
            value: String(officer.user_id),
            label: officer.name ?? officer.war_name ?? `Policial #${officer.id}`,
            keywords: [
              officer.war_name,
              officer.registration_number,
              officer.badge_number,
              officer.user?.email,
            ].filter(Boolean) as string[],
          })),
        ]}
      />

      <Button type="button" variant="outline" onClick={onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
