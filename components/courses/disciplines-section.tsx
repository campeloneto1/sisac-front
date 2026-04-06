"use client";

import { useMemo, useState } from "react";
import { BookCopy, Clock3, Pencil, Plus, Trash2 } from "lucide-react";

import { useDeleteCourseDisciplineMutation } from "@/hooks/use-course-discipline-mutations";
import { useCourseDisciplines } from "@/hooks/use-course-disciplines";
import { usePermissions } from "@/hooks/use-permissions";
import type { CourseDisciplineItem } from "@/types/course-discipline.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseDisciplinesDialog } from "@/components/courses/disciplines-dialog";

interface CourseDisciplinesSectionProps {
  courseId: number;
  courseName: string;
}

export function CourseDisciplinesSection({ courseId, courseName }: CourseDisciplinesSectionProps) {
  const permissions = usePermissions("course-disciplines");
  const deleteMutation = useDeleteCourseDisciplineMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<CourseDisciplineItem | null>(null);
  const [disciplineToDelete, setDisciplineToDelete] = useState<CourseDisciplineItem | null>(null);
  const filters = useMemo(
    () => ({
      course_id: courseId,
      per_page: 100,
    }),
    [courseId],
  );
  const disciplinesQuery = useCourseDisciplines(filters, permissions.canViewAny || permissions.canView);

  async function handleDelete() {
    if (!disciplineToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(disciplineToDelete.id);
    setDisciplineToDelete(null);
  }

  if (!permissions.canViewAny && !permissions.canView) {
    return null;
  }

  const disciplines = disciplinesQuery.data?.data ?? [];

  return (
    <>
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Disciplinas</CardTitle>
            <CardDescription>Organize a grade do curso com nome, carga horaria e ordem pedagogica.</CardDescription>
          </div>

          {permissions.canCreate ? (
            <Button
              onClick={() => {
                setEditingDiscipline(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova disciplina
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {disciplinesQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : disciplinesQuery.isError ? (
            <p className="text-sm text-slate-500">Nao foi possivel carregar as disciplinas deste curso.</p>
          ) : disciplines.length ? (
            <div className="space-y-3">
              {disciplines.map((discipline) => (
                <div key={discipline.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{discipline.name}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                          Ordem {discipline.order ?? 0}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <BookCopy className="h-4 w-4 text-primary" />
                          <span>Curso: {courseName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 className="h-4 w-4 text-primary" />
                          <span>{discipline.workload_hours ? `${discipline.workload_hours} horas` : "Carga horaria nao informada"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      {permissions.canUpdate ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingDiscipline(discipline);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button size="icon" variant="outline" onClick={() => setDisciplineToDelete(discipline)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma disciplina encontrada para este curso.</p>
          )}
        </CardContent>
      </Card>

      <CourseDisciplinesDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courseId={courseId}
        courseName={courseName}
        discipline={editingDiscipline}
      />

      <Dialog open={Boolean(disciplineToDelete)} onOpenChange={(open) => !open && setDisciplineToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir disciplina</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a disciplina {disciplineToDelete?.name}? Essa acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDisciplineToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
