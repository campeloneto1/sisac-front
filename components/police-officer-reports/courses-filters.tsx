"use client";

import { Search, X } from "lucide-react";

import { COURSE_ENROLLMENT_STATUS_OPTIONS } from "@/types/course-enrollment.type";
import { useCourseClasses } from "@/hooks/use-course-classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoliceOfficerCoursesFiltersProps {
  search: string;
  courseClassId: string;
  courseStatus: string;
  dateFrom: string;
  dateTo: string;
  onSearchChange: (value: string) => void;
  onCourseClassChange: (value: string) => void;
  onCourseStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export function PoliceOfficerCoursesFilters(props: PoliceOfficerCoursesFiltersProps) {
  const courseClassesQuery = useCourseClasses({ per_page: 100 });

  return (
    <div className="grid gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative md:col-span-2 xl:col-span-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Buscar por policial" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} />
      </div>
      <Select value={props.courseClassId} onValueChange={props.onCourseClassChange}>
        <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as turmas</SelectItem>
          {(courseClassesQuery.data?.data ?? []).map((courseClass) => (
            <SelectItem key={courseClass.id} value={String(courseClass.id)}>
              {courseClass.name ?? `Turma ${courseClass.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={props.courseStatus} onValueChange={props.onCourseStatusChange}>
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {COURSE_ENROLLMENT_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" value={props.dateFrom} onChange={(event) => props.onDateFromChange(event.target.value)} />
      <Input type="date" value={props.dateTo} onChange={(event) => props.onDateToChange(event.target.value)} />
      <Button type="button" variant="outline" onClick={props.onClear}>
        <X className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}
