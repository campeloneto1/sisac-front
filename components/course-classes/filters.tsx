"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import type { CourseItem } from "@/types/course.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseClassesFiltersProps {
  search: string;
  courseId: string;
  status: string;
  courses: CourseItem[];
  onSearchChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function CourseClassesFilters({
  search,
  courseId,
  status,
  courses,
  onSearchChange,
  onCourseChange,
  onStatusChange,
  onClear,
}: CourseClassesFiltersProps) {
  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardContent className="grid gap-4 p-6 md:grid-cols-[1.2fr_1fr_0.8fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="course-class-search">Busca</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="course-class-search"
              className="pl-9"
              placeholder="Buscar por nome da turma"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Curso</Label>
          <Select value={courseId} onValueChange={onCourseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="planned">Planejada</SelectItem>
              <SelectItem value="ongoing">Em andamento</SelectItem>
              <SelectItem value="completed">Concluida</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" onClick={onClear}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </CardContent>
    </Card>
  );
}
