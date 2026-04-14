"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteCourseClassMutation } from "@/hooks/use-course-class-mutations";
import { formatBrazilianDateRange } from "@/lib/date-formatter";
import type { CourseClassItem } from "@/types/course-class.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getStatusVariant(status?: string | null) {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    case "ongoing":
      return "warning";
    default:
      return "info";
  }
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "planned":
      return "Planejada";
    case "ongoing":
      return "Em andamento";
    case "completed":
      return "Concluída";
    case "cancelled":
      return "Cancelada";
    default:
      return "Sem status";
  }
}

interface CourseClassesTableProps {
  courseClasses: CourseClassItem[];
}

export function CourseClassesTable({ courseClasses }: CourseClassesTableProps) {
  const permissions = usePermissions("course-classes");
  const deleteMutation = useDeleteCourseClassMutation();
  const [courseClassToDelete, setCourseClassToDelete] = useState<CourseClassItem | null>(null);

  async function handleDelete() {
    if (!courseClassToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(courseClassToDelete.id);
    setCourseClassToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Planejamento</th>
                <th className="px-4 py-3 font-medium">Execução</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {courseClasses.map((courseClass) => (
                <tr key={courseClass.id} className="border-t border-slate-200/70">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{courseClass.name ?? `Turma #${courseClass.id}`}</p>
                      <p className="mt-1 text-slate-500">{courseClass.disciplines?.length ?? 0} disciplinas na grade da turma</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {courseClass.course ? `${courseClass.course.name} (${courseClass.course.abbreviation})` : "Curso não informado"}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{formatBrazilianDateRange(courseClass.planned_start_date, courseClass.planned_end_date)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    <div>
                      <p>{formatBrazilianDateRange(courseClass.start_date, courseClass.end_date)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getStatusVariant(courseClass.status)}>{getStatusLabel(courseClass.status)}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/course-classes/${courseClass.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link href={`/course-classes/${courseClass.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setCourseClassToDelete(courseClass)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(courseClassToDelete)} onOpenChange={(open) => !open && setCourseClassToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir turma</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {courseClassToDelete?.name ?? `a turma #${courseClassToDelete?.id}`}? Se houver vínculos operacionais, a API pode bloquear a exclusão.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCourseClassToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
